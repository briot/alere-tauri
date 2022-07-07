use serde::Deserialize;

#[derive(Deserialize)]
#[serde(transparent)]   // serialize as if it was only 'max'
pub struct Occurrences {
    max: Option<u16>,
}

impl Occurrences {
    pub fn new(max: Option<u16>) -> Self {
        Occurrences {
            max: max,
        }
    }

    pub fn get_max_occurrences(&self) -> u16 {
        self.max.unwrap_or(2000)
    }

    pub fn No_Recurrence() -> Self {
        Occurrences::new(Some(0))
    }
}