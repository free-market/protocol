use crate::engine::workflow_step::WorkflowStep;
pub mod transfer_spl_tokens;
pub mod wormhole;

pub fn get_workflow_step(step_id: u16) -> Box<dyn WorkflowStep> {
    match step_id {
        1 => transfer_spl_tokens::instance(),
        2 => wormhole::instance(),
        _ => panic!("unknown step_id {}", step_id),
    }
}
