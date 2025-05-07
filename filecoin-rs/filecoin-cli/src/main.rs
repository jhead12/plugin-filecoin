use crate::clap::Parser;
use crate::filecoin::Filecoin;

pub use writer::write_multiple_rows_as_car;
pub use writer::BlockIndexEntry;
pub use reader::read_all_rows_from_car_reader;
pub use reader::read_block_at_offset_reader;
pub use reader::generate_index_from_car_reader;
pub use types::*;
pub use encoding::*;

fn main() {
    let cmd = clap::Command::new("cargo")
        .bin_name("cargo")
        .styles(CLAP_STYLING)
        .subcommand_required(true)
        .subcommand(
            clap::command!("wrap").arg(
                clap::arg!(--"manifest-path" <PATH>)
                    .value_parser(clap::value_parser!(std::path::PathBuf)),
            ),
        );
    let matches = cmd.get_matches();
    let matches = match matches.subcommand() {
        Some(("wrap", matches)) => matches,
        _ => unreachable!("clap should ensure we don't get here"),
    };
    let manifest_path = matches.get_one::<std::path::PathBuf>("manifest-path");
    println!("{manifest_path:?}");

    // Use the cars functionality to wrap data into a CAR
    let car_data = write_multiple_rows_as_car(manifest_path.unwrap());
    println!("CAR data: {:?}", car_data);
}

// See also `clap_cargo::style::CLAP_STYLING`
pub const CLAP_STYLING: clap::builder::styling::Styles = clap::builder::styling::Styles::styled()
    .header(clap_cargo::style::HEADER)
    .usage(clap_cargo::style::USAGE)
    .literal(clap_cargo::style::LITERAL)
    .placeholder(clap_cargo::style::PLACEHOLDER)
    .error(clap_cargo::style::ERROR)
    .valid(clap_cargo::style::VALID)
    .invalid(clap_cargo::style::INVALID);