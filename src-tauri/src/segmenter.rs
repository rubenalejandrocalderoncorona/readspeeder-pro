/// Phrase segmentation logic — direct port of lib/parser.ts segmentIntoPhrases()
/// and divideIntoExercises().

pub fn segment_into_phrases(text: &str, max_words: usize) -> Vec<String> {
    // Normalise whitespace
    let normalised: String = text
        .replace("\r\n", " ")
        .split('\n')
        .collect::<Vec<_>>()
        .join(" ");

    let words: Vec<&str> = normalised
        .split_whitespace()
        .filter(|w| !w.is_empty())
        .collect();

    let mut phrases: Vec<String> = Vec::new();
    let mut current: Vec<&str> = Vec::new();

    for (i, &word) in words.iter().enumerate() {
        current.push(word);

        let at_max = current.len() >= max_words;
        let ends_clause = ends_with_clause_punct(word);
        let next_is_cap = words
            .get(i + 1)
            .map(|w| w.chars().next().map(|c| c.is_uppercase()).unwrap_or(false))
            .unwrap_or(false);
        let strong_break = ends_with_strong_punct(word) && next_is_cap;

        if at_max || strong_break {
            let phrase = current.join(" ");
            if !phrase.trim().is_empty() {
                phrases.push(phrase);
            }
            current.clear();
        } else if ends_clause && current.len() >= max_words.saturating_sub(1).max(2) {
            let phrase = current.join(" ");
            if !phrase.trim().is_empty() {
                phrases.push(phrase);
            }
            current.clear();
        }
    }

    if !current.is_empty() {
        let phrase = current.join(" ");
        if !phrase.trim().is_empty() {
            phrases.push(phrase);
        }
    }

    phrases
}

fn ends_with_clause_punct(word: &str) -> bool {
    word.ends_with('.')
        || word.ends_with('!')
        || word.ends_with('?')
        || word.ends_with(';')
        || word.ends_with(':')
        || word.ends_with(',')
        || word.ends_with('—')
        || word.ends_with('–')
}

fn ends_with_strong_punct(word: &str) -> bool {
    word.ends_with('.') || word.ends_with('!') || word.ends_with('?')
}

pub fn divide_into_exercises(phrases: &[String], target_words: usize) -> Vec<Vec<String>> {
    let mut exercises: Vec<Vec<String>> = Vec::new();
    let mut current: Vec<String> = Vec::new();
    let mut word_count: usize = 0;

    for phrase in phrases {
        let pw = phrase.split_whitespace().count();
        current.push(phrase.clone());
        word_count += pw;

        if word_count >= target_words {
            exercises.push(current.clone());
            current.clear();
            word_count = 0;
        }
    }

    if !current.is_empty() {
        exercises.push(current);
    }

    exercises
}
