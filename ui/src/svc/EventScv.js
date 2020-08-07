class EventsService {
    constructor(serverClient) {
        this.serverClient = serverClient;
    }

    async getEvent(eventId) {
        return (await this.serverClient.fetch('/api/events/' + eventId)).json()
    }

    async getAllEvents() {
        return (await this.serverClient.fetch('/api/events', {
            method: 'GET',
        })).json();
    }
}

export default EventsService;
