import type { SubjectGenerator } from "../types";
import { makeFactBankGenerator, type Fact, type FactBankConfig } from "../factbank";

const ARTS: Fact[] = [
  // ── Colour & painting ──
  { q: "The three primary colours are:", a: "red, blue and yellow", wrong: ["green, orange and purple", "black, white and grey", "pink, brown and gold"], topics: ["Drawing & Painting", "Visual arts"] },
  { q: "Mixing two primary colours produces a:", a: "secondary colour", wrong: ["primary colour", "neutral colour", "shade"], topics: ["Drawing & Painting", "Digital Art Basics"] },
  { q: "Red and yellow mixed together make:", a: "orange", wrong: ["green", "purple", "brown"], topics: ["Drawing & Painting"] },
  { q: "Blue and yellow mixed together make:", a: "green", wrong: ["orange", "purple", "grey"], topics: ["Drawing & Painting"] },
  { q: "Adding white to a colour makes a:", a: "tint", wrong: ["shade", "tone", "hue"], topics: ["Drawing & Painting", "Visual arts"] },
  { q: "Adding black to a colour makes a:", a: "shade", wrong: ["tint", "primary colour", "outline"], topics: ["Drawing & Painting", "Visual arts"] },
  { q: "Colours opposite each other on the colour wheel are called:", a: "complementary colours", wrong: ["primary colours", "warm colours", "neutral colours"], topics: ["Drawing & Painting", "Architecture & Design"] },
  { q: "Red, orange and yellow are described as:", a: "warm colours", wrong: ["cool colours", "neutral colours", "primary colours only"], topics: ["Drawing & Painting", "Visual arts"] },
  { q: "Blue, green and violet are described as:", a: "cool colours", wrong: ["warm colours", "earth colours", "secondary colours only"], topics: ["Drawing & Painting"] },
  { q: "A picture of arranged objects such as fruit and a jug is a:", a: "still life", wrong: ["portrait", "landscape", "collage"], topics: ["Drawing & Painting", "Visual arts"] },
  { q: "A drawing or painting of a person's face is a:", a: "portrait", wrong: ["still life", "landscape", "mural"], topics: ["Drawing & Painting"] },
  { q: "A painting of natural scenery such as hills and rivers is a:", a: "landscape", wrong: ["portrait", "still life", "abstract"], topics: ["Drawing & Painting", "Architecture & Design"] },
  { q: "Sketching lightly with a pencil before painting helps an artist to:", a: "plan the composition", wrong: ["waste materials", "avoid drawing", "damage the paper"], topics: ["Drawing & Painting", "Visual arts"] },
  { q: "The way parts of an artwork are arranged within the frame is its:", a: "composition", wrong: ["texture", "medium", "gallery"], topics: ["Drawing & Painting", "Visual arts", "Architecture & Design"] },

  // ── Elements & craft ──
  { q: "A repeated arrangement of shapes, lines or colours is a:", a: "pattern", wrong: ["texture", "silhouette", "still life"], topics: ["Weaving & Patterns", "Craft & Textile"] },
  { q: "How a surface feels or looks like it would feel is its:", a: "texture", wrong: ["tone", "tempo", "scale"], topics: ["Craft & Textile", "Visual arts"] },
  { q: "The outline shape of an object filled in solid, usually dark, is a:", a: "silhouette", wrong: ["sketch", "collage", "montage"], topics: ["Printing Techniques", "Visual arts"] },
  { q: "Clay is shaped into pots and figures through:", a: "modelling", wrong: ["printing", "sketching", "dyeing"], topics: ["Clay Modelling", "Craft & Textile"] },
  { q: "Making cloth by crossing threads over and under each other is:", a: "weaving", wrong: ["knitting", "printing", "moulding"], topics: ["Weaving & Patterns", "Craft & Textile", "Fashion & Textiles"] },
  { q: "Colouring cloth by tying parts so dye cannot reach them is:", a: "tie and dye", wrong: ["batik with wax", "screen printing", "embroidery"], topics: ["Craft & Textile", "Fashion & Textiles"] },
  { q: "Printing a design by pressing a carved surface onto paper is:", a: "block printing", wrong: ["batik", "quilling", "montage"], topics: ["Printing Techniques", "Craft & Textile"] },
  { q: "Making a picture by sticking pieces of paper or fabric onto a surface is a:", a: "collage", wrong: ["mosaic in stone", "woodcut", "portrait"], topics: ["Paper Craft", "Craft & Textile"] },
  { q: "A picture made from small pieces of coloured tile, glass or stone is a:", a: "mosaic", wrong: ["collage", "fresco", "etching"], topics: ["Paper Craft", "Craft & Textile"] },
  { q: "Rolling paper strips into coiled shapes to decorate a card is:", a: "quilling", wrong: ["origami", "weaving", "carving"], topics: ["Paper Craft"] },
  { q: "Folding paper into shapes without cutting or gluing is:", a: "origami", wrong: ["papier-mâché", "quilling", "collage"], topics: ["Paper Craft"] },

  // ── Photography & digital ──
  { q: "In photography, keeping the main subject sharp and clear is called:", a: "focus", wrong: ["zoom", "flash", "framing"], topics: ["Photography & Film", "Photography Appreciation", "Digital Art Basics"] },
  { q: "Editing a photo to make it brighter or change its colours is called:", a: "post-processing", wrong: ["printing", "framing", "exposure"], topics: ["Photography & Film", "Digital Art Basics"] },
  { q: "A short moving-picture story recorded with a camera is a:", a: "film", wrong: ["mural", "score", "sculpture"], topics: ["Photography & Film"] },

  // ── Music ──
  { q: "In music, the pattern of long and short sounds in time is:", a: "rhythm", wrong: ["pitch", "timbre", "harmony"], topics: ["Music & Singing", "Music Theory & Practice", "Music Composition"] },
  { q: "How high or low a musical sound is refers to its:", a: "pitch", wrong: ["tempo", "dynamics", "rhythm"], topics: ["Music & Singing", "Music Theory & Practice"] },
  { q: "The speed of a piece of music is its:", a: "tempo", wrong: ["pitch", "harmony", "texture"], topics: ["Music & Singing", "Music Theory & Practice"] },
  { q: "How loud or soft music is played refers to:", a: "dynamics", wrong: ["melody", "pitch", "form"], topics: ["Music Theory & Practice", "Music & Singing"] },
  { q: "A tune made of a series of single notes is a:", a: "melody", wrong: ["chord", "rhythm", "scale"], topics: ["Music & Singing", "Music Composition"] },
  { q: "Two or more notes sounded together make a:", a: "chord", wrong: ["beat", "rest", "octave"], topics: ["Music Theory & Practice", "Music Composition"] },
  { q: "A steady pulse you can clap along to in music is the:", a: "beat", wrong: ["lyric", "verse", "key"], topics: ["Music & Singing", "Music Theory & Practice"] },
  { q: "The drum, nyatiti and orutu are examples of:", a: "traditional musical instruments", wrong: ["dance styles", "song titles", "art media"], topics: ["Music & Singing", "Music Composition"] },
  { q: "A group of people singing together is a:", a: "choir", wrong: ["band", "cast", "troupe"], topics: ["Music & Singing"] },

  // ── Drama & dance ──
  { q: "A performance where actors present a story to an audience is:", a: "drama", wrong: ["sculpture", "collage", "weaving"], topics: ["Drama & Role Play", "Drama & Theatre", "Drama & Performance"] },
  { q: "The words an actor speaks in a play are called the:", a: "dialogue", wrong: ["set", "props", "costume"], topics: ["Drama & Role Play", "Drama & Performance"] },
  { q: "Objects an actor uses on stage, such as a walking stick, are:", a: "props", wrong: ["scenery", "scripts", "cues"], topics: ["Drama & Theatre", "Drama & Performance"] },
  { q: "The clothes an actor wears to look like the character are the:", a: "costume", wrong: ["backdrop", "lighting", "make-up chair"], topics: ["Drama & Theatre", "Fashion & Textiles"] },
  { q: "The person who guides the actors and shapes the whole play is the:", a: "director", wrong: ["usher", "prompter", "critic"], topics: ["Drama & Theatre", "Drama & Performance"] },
  { q: "The area where performers present to an audience is the:", a: "stage", wrong: ["gallery", "studio", "kiln"], topics: ["Dance & Movement", "Performance Arts"] },
  { q: "In a short skit, acting out a character's part is called:", a: "role play", wrong: ["narration", "miming only", "rehearsal"], topics: ["Drama & Role Play"] },
  { q: "Telling a story using only body movement and no words is:", a: "mime", wrong: ["chorus", "monologue", "recitation"], topics: ["Drama & Role Play", "Dance & Movement"] },
  { q: "Moving the body in time to music to express ideas or feelings is:", a: "dance", wrong: ["sketching", "sculpting", "editing"], topics: ["Dance & Movement", "Performance Arts"] },

  // ── Sports & PE ──
  { q: "Fair play in sport means:", a: "following the rules and respecting others", wrong: ["winning at any cost", "arguing with the referee", "hiding the ball"], topics: ["Performance Arts", "Sports Science", "Physical Education"] },
  { q: "A warm-up before exercise helps to:", a: "prepare the muscles and prevent injury", wrong: ["make you tired first", "replace training", "cool the body down"], topics: ["Performance Arts", "Sports Science", "Physical Education"] },
  { q: "Gentle stretching after exercise (a cool-down) helps the body to:", a: "recover and reduce stiffness", wrong: ["build injury", "skip rest", "lose all fitness"], topics: ["Sports Science", "Physical Education"] },
  { q: "In a team game, passing the ball to a teammate in a better position shows:", a: "co-operation", wrong: ["selfishness", "time-wasting", "poor fitness"], topics: ["Performance Arts", "Dance & Movement", "Physical Education"] },
  { q: "The official who enforces the rules during a football match is the:", a: "referee", wrong: ["captain", "coach", "spectator"], topics: ["Physical Education", "Sports Science"] },
  { q: "Regular physical activity improves fitness, mood and:", a: "heart and lung health", wrong: ["eyesight only", "height only", "nothing measurable"], topics: ["Sports Science", "Physical Education"] },
  { q: "Drinking water during sport helps prevent:", a: "dehydration", wrong: ["stronger muscles", "faster running", "better aim"], topics: ["Sports Science", "Physical Education"] },
  { q: "In athletics, the event of running a short, very fast distance is a:", a: "sprint", wrong: ["marathon", "relay changeover", "high jump"], topics: ["Physical Education", "Sports Science"] },
];

export const ARTS_FACTS: FactBankConfig = { byBand: { lower: ARTS, upper: ARTS, junior: ARTS } };
export const ARTS_SPORTS_FACTS: FactBankConfig = { byBand: { junior: ARTS, upper: ARTS } };

export const creativeArtsGenerator: SubjectGenerator = makeFactBankGenerator(ARTS_FACTS);
export const creativeArtsAndSportsGenerator: SubjectGenerator = makeFactBankGenerator(ARTS_SPORTS_FACTS);
