// Risk hesabı ve uyarı eşikleri mutlak değerler kullanır (sağlık/disiplin 45, not 55, para, stat < 25); okul öncesinde
// stat tavanı 30 ve not/harçlık olmadığı için risk ve uyarılar hep "kırmızı" çıkıyordu. Bu yaştan önce yalnızca
// gösterilmez; risk hesabı, kriz olayları ve sonlar değişmez.
export const RISK_DISPLAY_MIN_AGE = 7;

export const isRiskWarningAge = (age: number): boolean => age >= RISK_DISPLAY_MIN_AGE;
