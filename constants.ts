
import { PsychologicalApproach } from './types';

export const APPROACH_STYLES: Record<PsychologicalApproach, { name: string; className: string }> = {
    [PsychologicalApproach.CBT]: {
        name: 'КПТ',
        className: 'bg-blue-100 text-blue-800',
    },
    [PsychologicalApproach.Gestalt]: {
        name: 'Гештальт',
        className: 'bg-green-100 text-green-800',
    },
    [PsychologicalApproach.Logotherapy]: {
        name: 'Логотерапия',
        className: 'bg-yellow-100 text-yellow-800',
    },
    [PsychologicalApproach.Systemic]: {
        name: 'Системный',
        className: 'bg-red-100 text-red-800',
    },
    [PsychologicalApproach.Integrative]: {
        name: 'Интегративный',
        className: 'bg-gray-200 text-gray-800',
    },
    [PsychologicalApproach.Unknown]: {
        name: 'Общий',
        className: 'bg-indigo-100 text-indigo-800',
    },
};
