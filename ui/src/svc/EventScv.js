class EventsService {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getEvent(eventId) {
        return (await this.serverClient.fetch('/api/v1/seucre/events/' + eventId + '/')).json()
    }

    async getAllEvents() {
        const responseBody = (await this.serverClient.fetch('/api/v1/secure/events/', {
            method: 'GET',
        })).json();

        return (await responseBody).events;
    }
}

export default EventsService;
