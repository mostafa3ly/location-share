export type Event = {
    type: EventType,
    payload: string
}

export enum EventType {
    login,
    logout,
    location
}