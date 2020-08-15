package mailgun

import (
	"context"
	"time"

	mailgun_client "github.com/mailgun/mailgun-go/v4"
	"github.com/mailgun/mailgun-go/v4/events"
	"go.uber.org/zap"
	"portal.mcgyouthandarts.org/pkg/services/emailer"
)

func New(logger *zap.SugaredLogger, senderAddress, mailgunDomain, mailgunApiKey, portalDomainName string, timeout time.Duration) emailer.Service {
	if mailgunDomain == "DEV" && mailgunApiKey == "DEV" {
		return &fakeImpl{
			logger: logger,
		}
	}
	emailImpl := &impl{
		client:           mailgun_client.NewMailgun(mailgunDomain, mailgunApiKey),
		timeout:          timeout,
		senderAddress:    senderAddress,
		portalDomainName: portalDomainName,
		logger:           logger,
	}
	emailImpl.startPollingForEvents()

	return emailImpl
}

type fakeImpl struct {
	logger *zap.SugaredLogger
}

type impl struct {
	client           mailgun_client.Mailgun
	timeout          time.Duration
	senderAddress    string
	portalDomainName string
	logger           *zap.SugaredLogger
}

func (m *impl) AccountConfirmed(userEmail, userName string) {
	go func() {
		msg := m.client.NewMessage(m.senderAddress, "Your MCG Alumni Portal Account is accepted!", `
Hi `+userName+`,

Your MCG Alumni Portal account has been confirmed by the admins. Visit `+m.portalDomainName+` to log in!
`, userEmail)

		status, id, err := m.client.Send(m.getContextWithTimeout(), msg)
		if err == nil {
			m.logger.Infof("Sent account confirmed email to %s: STATUS %s ID %s", userEmail, status, id)
		} else {
			m.logger.Errorf("Failed to send account confirmed email to %s: %+v", userEmail, err)
		}
	}()
}

func (f *fakeImpl) AccountConfirmed(userEmail, userName string) {
	f.logger.Infof("Skipping account confirmed email to %s", userEmail)
}

func (m *impl) getContextWithTimeout() context.Context {
	ctx, _ := context.WithTimeout(context.Background(), m.timeout)
	return ctx
}

func (m *impl) startPollingForEvents() {
	go func() {
		m.logger.Info("Starting to poll mailgun for events")

		poller := m.client.PollEvents(&mailgun_client.ListEventOptions{
			Begin:        time.Now(),
			Compact:      true,
			PollInterval: time.Minute * 10,
		})

		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		var page []mailgun_client.Event
		for poller.Poll(ctx, &page) {
			if len(page) == 0 {
				m.logger.Infof("Email poller heartbeat; no events")
				continue
			}
			if poller.Err() != nil {
				m.logger.Errorf("Email poller heartbeat; error %+v", poller.Err())
				continue
			}

			for _, event := range page {
				switch event.(type) {
				case *events.Accepted:
					m.logger.Infof("Event %s accepted", event.GetID())
				case *events.Delivered:
					m.logger.Infof("Event %s delivered", event.GetID())
				case *events.Rejected:
					m.logger.Errorf("Event %s rejected", event.GetID())
				case *events.Failed:
					m.logger.Errorf("Event %s failed", event.GetID())
				}
			}
		}
	}()
}
