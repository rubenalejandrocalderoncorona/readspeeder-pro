// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod parser;
mod segmenter;

use parser::parse_file;
use segmenter::{divide_into_exercises, segment_into_phrases};
use serde::{Deserialize, Serialize};

// ── Types shared with TypeScript ─────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct ParseFileResult {
    pub title: String,
    pub content: String,
    #[serde(rename = "wordCount")]
    pub word_count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SegmentResult {
    pub phrases: Vec<String>,
    pub exercises: Vec<Vec<String>>,
    #[serde(rename = "wordCount")]
    pub word_count: usize,
}

// ── Commands ──────────────────────────────────────────────────────────────────

/// Parse a file (TXT / PDF / EPUB) and return title + full text content.
/// Called from FileUploader when running inside Tauri.
#[tauri::command]
fn parse_file_native(file_path: String) -> Result<ParseFileResult, String> {
    let parsed = parse_file(&file_path)?;
    Ok(ParseFileResult {
        title: parsed.title,
        content: parsed.content,
        word_count: parsed.word_count,
    })
}

/// Segment a text string into phrases and divide into 800-word exercises.
/// max_words: 3–7 from the Max Phrase setting.
#[tauri::command]
fn segment_text(text: String, max_words: usize) -> SegmentResult {
    let mw = max_words.clamp(2, 10);
    let phrases = segment_into_phrases(&text, mw);
    let exercises = divide_into_exercises(&phrases, 800);
    let word_count = parser::count_words(&text);
    SegmentResult { phrases, exercises, word_count }
}

/// Combined: parse file then immediately segment.
/// Returns the first exercise's phrases plus metadata.
#[tauri::command]
fn parse_and_segment(file_path: String, max_words: usize) -> Result<SegmentResult, String> {
    let parsed = parse_file(&file_path)?;
    let mw = max_words.clamp(2, 10);
    let phrases = segment_into_phrases(&parsed.content, mw);
    let exercises = divide_into_exercises(&phrases, 800);
    Ok(SegmentResult {
        phrases,
        exercises,
        word_count: parsed.word_count,
    })
}

// ── Builder ───────────────────────────────────────────────────────────────────

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            parse_file_native,
            segment_text,
            parse_and_segment,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

