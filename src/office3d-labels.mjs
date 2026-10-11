// Keep room identity separate from the deliberately chaotic display punctuation.
export function roomLabel(name){return `${name.trim().split(/\s+/).join(' , ')} ! `;}
