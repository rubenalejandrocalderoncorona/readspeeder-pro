use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedText {
    pub title: String,
    pub content: String,
    #[serde(rename = "wordCount")]
    pub word_count: usize,
}

pub fn parse_file(path: &str) -> Result<ParsedText, String> {
    let p = Path::new(path);
    let ext = p
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase())
        .unwrap_or_default();

    match ext.as_str() {
        "txt" => parse_txt(path),
        "pdf" => parse_pdf(path),
        "epub" => parse_epub(path),
        other => Err(format!("Unsupported file type: .{other}")),
    }
}

// ── TXT ─────────────────────────────────────────────────────────────────────

fn parse_txt(path: &str) -> Result<ParsedText, String> {
    let raw = std::fs::read_to_string(path)
        .map_err(|e| format!("Cannot read file: {e}"))?;
    let content = clean_text(&raw);
    let title = content
        .lines()
        .next()
        .unwrap_or("Untitled")
        .trim()
        .chars()
        .take(80)
        .collect();
    let word_count = count_words(&content);
    Ok(ParsedText { title, content, word_count })
}

// ── PDF ─────────────────────────────────────────────────────────────────────

fn parse_pdf(path: &str) -> Result<ParsedText, String> {
    // Stream-based extraction — no full buffer for large files
    let bytes = read_file_capped(path, 50 * 1024 * 1024)?;
    let text = pdf_extract::extract_text_from_mem(&bytes)
        .map_err(|e| format!("PDF parse error: {e}"))?;

    let content = clean_text(&text);
    let title = derive_title_from_path(path, &content);
    let word_count = count_words(&content);
    Ok(ParsedText { title, content, word_count })
}

// ── EPUB ─────────────────────────────────────────────────────────────────────

fn parse_epub(path: &str) -> Result<ParsedText, String> {
    let mut doc = epub::doc::EpubDoc::new(path)
        .map_err(|e| format!("EPUB open error: {e}"))?;

    let title = doc
        .mdata("title")
        .map(|m| m.value.clone())
        .unwrap_or_else(|| derive_title_from_path(path, ""));

    let mut full_text = String::new();
    let num_pages = doc.get_num_chapters();

    for _ in 0..num_pages {
        if let Some((content, _mime)) = doc.get_current_str() {
            full_text.push(' ');
            full_text.push_str(&strip_html(&content));
        }
        doc.go_next();
    }

    let content = clean_text(&full_text);
    let word_count = count_words(&content);
    Ok(ParsedText { title, content, word_count })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

fn read_file_capped(path: &str, max_bytes: u64) -> Result<Vec<u8>, String> {
    use std::io::Read;
    let file = std::fs::File::open(path).map_err(|e| format!("Cannot open file: {e}"))?;
    let meta = file.metadata().map_err(|e| format!("Cannot stat file: {e}"))?;
    let size = meta.len().min(max_bytes);
    let mut buf = Vec::with_capacity(size as usize);
    let mut handle = file.take(max_bytes);
    handle.read_to_end(&mut buf).map_err(|e| format!("Read error: {e}"))?;
    Ok(buf)
}

fn strip_html(html: &str) -> String {
    let mut out = String::with_capacity(html.len());
    let mut in_tag = false;
    for ch in html.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => { in_tag = false; out.push(' '); }
            _ if !in_tag => out.push(ch),
            _ => {}
        }
    }
    out
}

pub fn clean_text(raw: &str) -> String {
    let s = raw
        .replace("\r\n", "\n")
        .replace('\r', "\n");

    // Remove control chars except tab and newline
    let s: String = s
        .chars()
        .filter(|&c| c == '\t' || c == '\n' || (c >= ' ' && c != '\x7f' && c != '\u{00ad}'))
        .collect();

    // De-hyphenate line wraps: "hy-\nphen" → "hyphen"
    let s = regex_replace_all(&s, r"([a-z])-\n([a-z])", "$1$2");

    // Collapse 3+ blank lines to 2
    let s = regex_replace_all(&s, r"\n{3,}", "\n\n");

    s.trim().to_string()
}

pub fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}

fn derive_title_from_path(path: &str, content: &str) -> String {
    // Try first content line
    if !content.is_empty() {
        let first = content.lines().next().unwrap_or("").trim();
        if !first.is_empty() && first.split_whitespace().count() <= 10 {
            return first.chars().take(80).collect();
        }
    }
    // Fallback: filename without extension
    Path::new(path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Untitled")
        .to_string()
}

// Thin regex wrapper to avoid repeating the compile step
fn regex_replace_all(text: &str, pattern: &str, replacement: &str) -> String {
    use once_cell::sync::Lazy;
    use regex::Regex;
    use std::collections::HashMap;
    use std::sync::Mutex;

    static CACHE: Lazy<Mutex<HashMap<String, Regex>>> =
        Lazy::new(|| Mutex::new(HashMap::new()));

    let mut cache = CACHE.lock().unwrap();
    let re = cache
        .entry(pattern.to_string())
        .or_insert_with(|| Regex::new(pattern).expect("invalid regex"));
    re.replace_all(text, replacement).into_owned()
}
