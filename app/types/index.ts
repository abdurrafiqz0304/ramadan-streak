export interface ReplacementDay {
    id: number;
    date: string;
    reason: string;
    completed: boolean;
}

export interface PrayerTimesType {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
}

export interface PrayerStatusType {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
}
