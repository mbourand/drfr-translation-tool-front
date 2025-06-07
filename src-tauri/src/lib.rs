// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::io::{Cursor, Write};

#[tauri::command]
async fn import_strings(
    source_data_win_path: &str,
    utmt_cli_folder_path: &str,
    git_chapter_folder_path: &str,
    git_root_folder_path: &str,
	output_data_win_path: &str,
) -> Result<(), String> {
	let import_script_path = format!("{}/Script/UMT/DRFR/ImporterToutTranslationTool.csx", git_root_folder_path);
	let utmt_cli_exe_path = format!("{}/UndertaleModCli.exe", utmt_cli_folder_path);

	let mut utmt_command = Command::new(utmt_cli_exe_path)
	.args(["load", &source_data_win_path, "-s", &import_script_path, "-o", &output_data_win_path])
	.stdin(Stdio::piped())
	.spawn()
	.map_err(|e| format!("Failed to start UndertaleModCli command: {}", e))?;

	let mut stdin = utmt_command.stdin.take().ok_or("Failed to open stdin for UndertaleModCli command")?;

	let git_chapter_folder_path_owned = git_chapter_folder_path.to_owned();
    std::thread::spawn(move || {
        let _ = stdin.write_all((git_chapter_folder_path_owned + "\n").as_bytes())
            .map_err(|e| format!("Failed to write base data directory to UndertaleModCli stdin: {}", e));
        let _ = stdin.flush().map_err(|e| format!("Failed to flush UndertaleModCli stdin: {}", e));
    });

	utmt_command.wait().map_err(|e| format!("Failed to wait for UndertaleModCli command: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn run_game_executable(game_folder_path: &str) -> Result<(), String> {
    let executable_path = format!("{}/DELTARUNE.exe", game_folder_path);
    std::process::Command::new(executable_path).current_dir(game_folder_path)
        .spawn()
        .map_err(|e| format!("Failed to start the game executable: {}", e))
        .map(|_| ())
}

#[tauri::command]
fn unzip_file(path: String, target_dir: String) -> Result<(), String> {
    let archive = std::fs::read(&path)
        .map_err(|e| format!("Error reading file {}: {}", path, e.to_string()))?;
    let target_dir_path = PathBuf::from(&target_dir);

    zip_extract::extract(Cursor::new(&archive), &target_dir_path, false)
        .map_err(|e| format!("Error extracting file {}: {}", path, e.to_string()))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![run_game_executable, import_strings, unzip_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
