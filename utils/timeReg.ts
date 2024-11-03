export function formatTime(time: string){
  const timeRegex = /(20\d{2}([\.\-/|年月\s]{1,3}\d{1,2}){2}日?(\s?\d{2}:\d{2}(:\d{2})?)?)|(\d{1,2}\s?(分钟|小时|天)前)/;
const timeMatch = timeRegex.exec(time);
if (timeMatch) {
    return timeMatch[0]; // Full date
}
  return null;
}