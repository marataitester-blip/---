
export enum Sender {
    User = 'user',
    Bot = 'bot'
}

export enum PsychologicalApproach {
    CBT = 'CBT',
    Gestalt = 'Gestalt',
    Logotherapy = 'Logotherapy',
    Systemic = 'Systemic',
    Integrative = 'Integrative',
    Unknown = 'Unknown'
}

export interface Message {
    id: string;
    text: string;
    sender: Sender;
    approach?: PsychologicalApproach;
}
