import type { MasterActionCatalog } from "@sc-mapping/shared-types";

export const MASTER_ACTION_CATALOG: MasterActionCatalog = {
  "IFCS_controls": {
    "mapName": "IFCS_controls",
    "label": "IFCS Controls",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_IFCS_A",
        "label": "IFCS A",
        "category": "IFCS Controls",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_IFCS_B",
        "label": "IFCS B",
        "category": "IFCS Controls",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_IFCS_X",
        "label": "IFCS X",
        "category": "IFCS Controls",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_IFCS_Y",
        "label": "IFCS Y",
        "category": "IFCS Controls",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "RemoteRigidEntityController": {
    "mapName": "RemoteRigidEntityController",
    "label": "RemoteRigidEntityController",
    "domain": "general",
    "actions": [
      {
        "name": "remote_moveForward",
        "label": "Remote MoveForward",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_moveBack",
        "label": "Remote MoveBack",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_moveLeft",
        "label": "Remote MoveLeft",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_moveRight",
        "label": "Remote MoveRight",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_moveUp",
        "label": "Remote MoveUp",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_moveDown",
        "label": "Remote MoveDown",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_scaleUp",
        "label": "Remote ScaleUp",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_scaleDown",
        "label": "Remote ScaleDown",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_rollLeft",
        "label": "Remote RollLeft",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_rollRight",
        "label": "Remote RollRight",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_rotatePitch",
        "label": "Remote RotatePitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_rotateYaw",
        "label": "Remote RotateYaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_switchControl",
        "label": "Remote SwitchControl",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_stopControl",
        "label": "Remote StopControl",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_action1",
        "label": "Remote Action1",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_action2",
        "label": "Remote Action2",
        "category": "RemoteRigidEntityController",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "remote_switchTarget",
        "label": "Remote SwitchTarget",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      }
    ]
  },
  "character_customizer": {
    "mapName": "character_customizer",
    "label": "Character Customizer",
    "domain": "general",
    "actions": [
      {
        "name": "character_customizer_yaw",
        "label": "Character Customizer Yaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_pitch",
        "label": "Character Customizer Pitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_gp_yaw",
        "label": "Character Customizer Gp Yaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_gp_pitch",
        "label": "Character Customizer Gp Pitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_zoom_in",
        "label": "Character Customizer Zoom In",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_zoom_out",
        "label": "Character Customizer Zoom Out",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_select",
        "label": "Character Customizer Select",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_enable_dna_edit",
        "label": "Character Customizer Enable Dna Edit",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_enable_rotation",
        "label": "Character Customizer Enable Rotation",
        "category": "Character Customizer",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_enable_mouse_rotation",
        "label": "Character Customizer Enable Mouse Rotation",
        "category": "Character Customizer",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_library_scroll_up",
        "label": "Character Customizer Library Scroll Up",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_library_scroll_down",
        "label": "Character Customizer Library Scroll Down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_edit_dna_pos",
        "label": "Character Customizer Edit Dna Pos",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_edit_dna_neg",
        "label": "Character Customizer Edit Dna Neg",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_yaw_left",
        "label": "Character Customizer Yaw Left",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_yaw_right",
        "label": "Character Customizer Yaw Right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_pitch_up",
        "label": "Character Customizer Pitch Up",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_pitch_down",
        "label": "Character Customizer Pitch Down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_step_up",
        "label": "Character Customizer Step Up",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_step_down",
        "label": "Character Customizer Step Down",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_feature_up",
        "label": "Character Customizer Feature Up",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_feature_down",
        "label": "Character Customizer Feature Down",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_dnamode_up",
        "label": "Character Customizer Dnamode Up",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_dnamode_down",
        "label": "Character Customizer Dnamode Down",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_next_material_region",
        "label": "Character Customizer Next Material Region",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_toggle_face_tracking",
        "label": "Character Customizer Toggle Face Tracking",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_dnaHandle_select",
        "label": "Character Customizer DnaHandle Select",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "character_customizer_dnaHandle_deselect",
        "label": "Character Customizer DnaHandle Deselect",
        "category": "Character Customizer",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "debug": {
    "mapName": "debug",
    "label": "Debug",
    "domain": "general",
    "actions": [
      {
        "name": "godmode",
        "label": "Godmode",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "debug_pause",
        "label": "Debug Pause",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pause_and_fly",
        "label": "Pause And Fly",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "debug_pause_alt",
        "label": "Debug Pause Alt",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "debug_time_slower",
        "label": "Debug Time Slower",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "debug_time_faster",
        "label": "Debug Time Faster",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "teleport_to_camera",
        "label": "Teleport To Camera",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "toggleaidebugdraw",
        "label": "Toggleaidebugdraw",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ai_DebugCenterViewAgent",
        "label": "Ai DebugCenterViewAgent",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "togglepdrawhelpers",
        "label": "Togglepdrawhelpers",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mannequin_debugai",
        "label": "Mannequin Debugai",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pl_result_state_debug_target",
        "label": "Pl Result State Debug Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mov_advance_all_sequences",
        "label": "Mov Advance All Sequences",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mov_pause_resume_all_sequences",
        "label": "Mov Pause Resume All Sequences",
        "category": "Debug",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "default": {
    "mapName": "default",
    "label": "Social - General",
    "domain": "general",
    "actions": [
      {
        "name": "skip_cutscene",
        "label": "Skip Cutscene",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "cam_toggle_cinematic",
        "label": "Cam Toggle Cinematic",
        "category": "Default",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "objectives",
        "label": "Objectives",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "toggle_trackview",
        "label": "Toggle Trackview",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "toggle_action_profile",
        "label": "Toggle Action Profile",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "respawn",
        "label": "Re-spawn",
        "category": "Default",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "retry",
        "label": "Retry",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ready",
        "label": "Ready",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pl_exit",
        "label": "Exit seat",
        "category": "PlayerActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flymode",
        "label": "Flymode",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flymode_strafe_up",
        "label": "Flymode Strafe Up",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flymode_strafe_down",
        "label": "Flymode Strafe Down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flymode_roll_left",
        "label": "Flymode Roll Left",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flymode_roll_right",
        "label": "Flymode Roll Right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_toggle_pause",
        "label": "Ui Toggle Pause",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_click",
        "label": "Ui Click",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_back",
        "label": "Back",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_up",
        "label": "Ui Up",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_down",
        "label": "Ui Down",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_left",
        "label": "Ui Left",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_right",
        "label": "Ui Right",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_select",
        "label": "Ui Select",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_secondary_select",
        "label": "Ui Secondary Select",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_radialmenu_pageleft",
        "label": "Ui Radialmenu Pageleft",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_radialmenu_pageright",
        "label": "Ui Radialmenu Pageright",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_confirm",
        "label": "Confirm",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_reset",
        "label": "Reset",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_skip_video",
        "label": "Ui Skip Video",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_hide_hint",
        "label": "Ui Hide Hint",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_primaryTab_increment",
        "label": "Ui PrimaryTab Increment",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_primaryTab_decrement",
        "label": "Ui PrimaryTab Decrement",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_secondaryTab_increment",
        "label": "Ui SecondaryTab Increment",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_secondaryTab_decrement",
        "label": "Ui SecondaryTab Decrement",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_focus_increment",
        "label": "Ui Focus Increment",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_focus_decrement",
        "label": "Ui Focus Decrement",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_mouse",
        "label": "Flashui Mouse",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_return",
        "label": "Flashui Return",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_backspace",
        "label": "Flashui Backspace",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_spacebar",
        "label": "Flashui Spacebar",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_tab",
        "label": "Flashui Tab",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_kp_2",
        "label": "Flashui Kp 2",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_kp_3",
        "label": "Flashui Kp 3",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_kp_4",
        "label": "Flashui Kp 4",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_kp_7",
        "label": "Flashui Kp 7",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_up",
        "label": "Flashui Up",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_down",
        "label": "Flashui Down",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_left",
        "label": "Flashui Left",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flashui_right",
        "label": "Flashui Right",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "notification_accept",
        "label": "Notifications - Accept Prompt",
        "category": "Notifications",
        "description": "Notifications - Accept Prompt",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "notification_decline",
        "label": "Notifications - Decline Prompt",
        "category": "Notifications",
        "description": "Notifications - Decline Prompt",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "toggle_contact",
        "label": "CommLink App (Toggle)",
        "category": "MobiGlasActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "toggle_chat",
        "label": "Chat Window (Toggle)",
        "category": "MobiGlasActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "cycle_chat_lobby",
        "label": "Cycle Chat Lobby",
        "category": "Default",
        "description": "Press to cycle through subscribed lobbies in chat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "focus_on_chat_textinput",
        "label": "Chat Window Focus",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_copy",
        "label": "Copy",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_cut",
        "label": "Cut",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_paste",
        "label": "Paste",
        "category": "Default",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "flycam": {
    "mapName": "flycam",
    "label": "Flycam",
    "domain": "spectator",
    "actions": [
      {
        "name": "flycam_rotateyaw",
        "label": "Flycam Rotateyaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_rotatepitch",
        "label": "Flycam Rotatepitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_rotateyaw_mouse",
        "label": "Flycam Rotateyaw Mouse",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_rotatepitch_mouse",
        "label": "Flycam Rotatepitch Mouse",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_movey",
        "label": "Flycam Movey",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_movefwd",
        "label": "Flycam Movefwd",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_moveback",
        "label": "Flycam Moveback",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_movex",
        "label": "Flycam Movex",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_moveright",
        "label": "Flycam Moveright",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_moveleft",
        "label": "Flycam Moveleft",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_movez",
        "label": "Flycam Movez",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_moveup",
        "label": "Flycam Moveup",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_movedown",
        "label": "Flycam Movedown",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_speedup",
        "label": "Flycam Speedup",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_speeddown",
        "label": "Flycam Speeddown",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_turbo",
        "label": "Flycam Turbo",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_setpoint",
        "label": "Flycam Setpoint",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_play",
        "label": "Flycam Play",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "flycam_clear",
        "label": "Flycam Clear",
        "category": "Flycam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "hacking": {
    "mapName": "hacking",
    "label": "Hacking",
    "domain": "general",
    "actions": [
      {
        "name": "hacking_minigame_debug_toggle_command_input",
        "label": "Hacking Minigame Debug Toggle Command Input",
        "category": "Hacking",
        "defaultActivationMode": "double_tap",
        "defaultMultiTap": 2
      },
      {
        "name": "hacking_minigame_debug_mouse_x",
        "label": "Hacking Minigame Debug Mouse X",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_debug_mouse_y",
        "label": "Hacking Minigame Debug Mouse Y",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_mouse_lmb",
        "label": "Hacking Minigame Mouse Lmb",
        "category": "Hacking",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_mouse_rmb",
        "label": "Hacking Minigame Mouse Rmb",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_abort",
        "label": "Hacking Minigame Abort",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_help_window_toggle",
        "label": "Hacking Minigame Help Window Toggle",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_camera_control",
        "label": "Hacking Minigame Camera Control",
        "category": "Hacking",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_camera_x",
        "label": "Hacking Minigame Camera X",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_camera_y",
        "label": "Hacking Minigame Camera Y",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_movement_up",
        "label": "Hacking Minigame Movement Up",
        "category": "Hacking",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_movement_down",
        "label": "Hacking Minigame Movement Down",
        "category": "Hacking",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_movement_left",
        "label": "Hacking Minigame Movement Left",
        "category": "Hacking",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_movement_right",
        "label": "Hacking Minigame Movement Right",
        "category": "Hacking",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_swap_rotate_cw",
        "label": "Hacking Minigame Swap Rotate Cw",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_swap_rotate_ccw",
        "label": "Hacking Minigame Swap Rotate Ccw",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_ability_inject",
        "label": "Hacking Minigame Ability Inject",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_ability_ping",
        "label": "Hacking Minigame Ability Ping",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_ability_slowdown",
        "label": "Hacking Minigame Ability Slowdown",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_ability_swap",
        "label": "Hacking Minigame Ability Swap",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_ability_wraparound",
        "label": "Hacking Minigame Ability Wraparound",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hacking_minigame_cycle_input_mode",
        "label": "Hacking Minigame Cycle Input Mode",
        "category": "Hacking",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "incapacitated": {
    "mapName": "incapacitated",
    "label": "On Foot - All",
    "domain": "general",
    "actions": [
      {
        "name": "incapacitatedRespawn",
        "label": "Regen (while Incapacitated)",
        "category": "Incapacitated",
        "defaultActivationMode": "delayed_hold_long",
        "defaultMultiTap": 1
      }
    ]
  },
  "lights_controller": {
    "mapName": "lights_controller",
    "label": "Lights",
    "domain": "general",
    "actions": [
      {
        "name": "v_lights",
        "label": "Headlights (Toggle)",
        "category": "Lights Controller",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_lights_on",
        "label": "Headlights\\n(Enable)",
        "category": "Lights Controller",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_lights_off",
        "label": "Headlights\\n(Enable)",
        "category": "Lights Controller",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_running_lights",
        "label": "Toggle Running Lights",
        "category": "Lights Controller",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_cabin_lights",
        "label": "Toggle Cabin Lights",
        "category": "Lights Controller",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      }
    ]
  },
  "mapui": {
    "mapName": "mapui",
    "label": "Mapui",
    "domain": "general",
    "actions": [
      {
        "name": "mapui_pan_left",
        "label": "Mapui Pan Left",
        "category": "Mapui",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_pan_right",
        "label": "Mapui Pan Right",
        "category": "Mapui",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_pan_forward",
        "label": "Mapui Pan Forward",
        "category": "Mapui",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_pan_back",
        "label": "Mapui Pan Back",
        "category": "Mapui",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_pan_up",
        "label": "Mapui Pan Up",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_pan_down",
        "label": "Mapui Pan Down",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_cycle_section_forward",
        "label": "Mapui Cycle Section Forward",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_cycle_section_backward",
        "label": "Mapui Cycle Section Backward",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_cycle_zone_forward",
        "label": "Mapui Cycle Zone Forward",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_cycle_zone_backward",
        "label": "Mapui Cycle Zone Backward",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_action_planroute",
        "label": "Mapui Action Planroute",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_action_clearroute",
        "label": "Mapui Action Clearroute",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_action_togglepin",
        "label": "Mapui Action Togglepin",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_action_mylocation",
        "label": "Mapui Action Mylocation",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_action_toggle_view_entire_zone",
        "label": "Mapui Action Toggle View Entire Zone",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_action_toggleQTActions",
        "label": "Mapui Action ToggleQTActions",
        "category": "Mapui",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_action_goto_selection",
        "label": "Mapui Action Goto Selection",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_action_step_back",
        "label": "Mapui Action Step Back",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mapui_action_goto_localmap",
        "label": "Mapui Action Goto Localmap",
        "category": "Mapui",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "mining": {
    "mapName": "mining",
    "label": "Mining",
    "domain": "onfoot",
    "actions": [
      {
        "name": "weapon_change_mining_throttle",
        "label": "Weapon Change Mining Throttle",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "player": {
    "mapName": "player",
    "label": "On Foot - All",
    "domain": "onfoot",
    "actions": [
      {
        "name": "moveleft",
        "label": "Move Left",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "moveright",
        "label": "Move Right",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "moveforward",
        "label": "Move Forward",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "moveback",
        "label": "Move Backwards",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "rotateyaw",
        "label": "Rotateyaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "rotatepitch",
        "label": "Rotatepitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "gp_movex",
        "label": "Move Left / Right",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "gp_movey",
        "label": "Move Forward / Backward",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "gp_rotateyaw",
        "label": "Look (Yaw)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "gp_rotatepitch",
        "label": "Look (Pitch)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "jump",
        "label": "Jump",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "jump_hold",
        "label": "Jump Thrusters - Activate (hold)",
        "category": "Player",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "jump_release",
        "label": "Jump Thrusters - Release",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "crouch",
        "label": "Crouch",
        "category": "PlayerActions",
        "defaultActivationMode": "hold_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "gp_jump",
        "label": "Jump",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "gp_crouch",
        "label": "Crouch",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "prone",
        "label": "Prone",
        "category": "PlayerActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "sprint",
        "label": "Sprint",
        "category": "Player",
        "defaultActivationMode": "hold_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "walk",
        "label": "Walk",
        "category": "Player",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "leanleft",
        "label": "Lean Left",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "leanright",
        "label": "Lean Right",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "ledgegrab",
        "label": "Climb Ledges",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "attack1",
        "label": "Firearm - Attack",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "attackSecondary",
        "label": "Tool - Secondary Fire",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "melee_AttackLightLeft",
        "label": "Melee - Attack Light Left",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "melee_AttackLightRight",
        "label": "Melee - Attack Light Right",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "melee_AttackHeavyLeft",
        "label": "Melee - Attack Heavy Left (Hold)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "melee_AttackHeavyRight",
        "label": "Melee - Attack Heavy Right (Hold)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "melee_block",
        "label": "Melee - Block (Hold)",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "melee_AttackSyringeStab",
        "label": "Medical Pen - Inject Other",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "melee_dodgeLeft",
        "label": "Dodge left",
        "category": "Player",
        "defaultActivationMode": "double_tap_nonblocking",
        "defaultMultiTap": 2
      },
      {
        "name": "melee_dodgeRight",
        "label": "Dodge Right",
        "category": "Player",
        "defaultActivationMode": "double_tap_nonblocking",
        "defaultMultiTap": 2
      },
      {
        "name": "melee_dodgeBack",
        "label": "Dodge Back",
        "category": "Player",
        "defaultActivationMode": "double_tap_nonblocking",
        "defaultMultiTap": 2
      },
      {
        "name": "restrain",
        "label": "Restrain",
        "category": "Player",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "weapon_melee",
        "label": "Melee - Attack (Ranged Weapon + Takedowns)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "takedown_nonLethal",
        "label": "Melee - Attack (Ranged Weapon + Takedowns)",
        "category": "Player",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "takedown_lethal",
        "label": "Takedown Lethal",
        "category": "Player",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "throw_overhand",
        "label": "Throw - Overarm \u0026 Two-Handed",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "throw_underhand",
        "label": "Throw - Underarm",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "zoom",
        "label": "Aim Down Sight",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "interact_with_scope",
        "label": "Interact With Scope (ADS)",
        "category": "Player",
        "description": "Interact With Scope (ADS)",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "toggle_lowered",
        "label": "Weapon Stance (Toggle)",
        "category": "Player",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "select_primary_pit",
        "label": "Select Primary Weapon",
        "category": "WeaponSelection",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "select_secondary_pit",
        "label": "Select Secondary Weapon",
        "category": "WeaponSelection",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "select_sidearm_pit",
        "label": "Select Sidearm",
        "category": "WeaponSelection",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "select_meleeweapon_pit",
        "label": "Select Melee",
        "category": "WeaponSelection",
        "description": "Select Melee",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "select_gadget_pit",
        "label": "Select Gadget",
        "category": "WeaponSelection",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "selectUnarmedCombat",
        "label": "Unarmed Combat",
        "category": "WeaponSelection",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "nextitem",
        "label": "Nextitem",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "prevItem",
        "label": "PrevItem",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "nextweapon",
        "label": "Next Weapon",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "prevweapon",
        "label": "Previous Weapon",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "reload",
        "label": "Reload",
        "category": "ItemActions",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "reloadSecondary",
        "label": "Reload Secondary Fire",
        "category": "ItemActions",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "ammoRepool",
        "label": "Repool Ammunition",
        "category": "ItemActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "holster",
        "label": "Holster Weapon",
        "category": "WeaponSelection",
        "defaultActivationMode": "delayed_press_medium",
        "defaultMultiTap": 1
      },
      {
        "name": "drop",
        "label": "Drop Item",
        "category": "Player",
        "description": "Drop Item",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "inspect",
        "label": "Inspect Item",
        "category": "Player",
        "description": "Inspect Item",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "customize",
        "label": "Customize Weapon",
        "category": "Player",
        "description": "Customize Weapon",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "stabilize",
        "label": "Hold Breath (ADS)",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "weapon_auxiliary_action",
        "label": "FPS Underbarrel Attachment Action",
        "category": "ItemActions",
        "description": "FPS Underbarrel Attachment Action",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "weapon_change_firemode",
        "label": "Change Fire Mode",
        "category": "ItemActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "weapon_zeroing_decrease",
        "label": "Weapon Zeroing Decrease",
        "category": "ItemActions",
        "description": "Adjust the weapon scope to accommodate a closer target distance into sighting.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "weapon_zeroing_increase",
        "label": "Weapon Zeroing Increase / Auto",
        "category": "ItemActions",
        "description": "Adjust the weapon scope to accommodate a farther target distance into sighting.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "fixed_speed_increment",
        "label": "Default Movement Speed Increase",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "fixed_speed_decrement",
        "label": "Default Movement Speed Decrease",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "use",
        "label": "Use",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "useAttachmentBottom",
        "label": "UseAttachmentBottom",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "useAttachmentTop",
        "label": "UseAttachmentTop",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "downedRevivalRequest",
        "label": "Request Rescue (while Incapacitated)",
        "category": "Player",
        "defaultActivationMode": "delayed_hold_long",
        "defaultMultiTap": 1
      },
      {
        "name": "toggle_flashlight",
        "label": "Flashlight (Toggle)",
        "category": "ItemActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "combathealtarget",
        "label": "Combathealtarget",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "delayed_hold",
        "defaultMultiTap": 1
      },
      {
        "name": "toggleEquipHelmet",
        "label": "Toggle Equip Helmet",
        "category": "ItemActions",
        "description": "Toggle Equip Helmet",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "toggleAttachHelmet",
        "label": "Helmet\\n(Equip)",
        "category": "ItemActions",
        "description": "Toggle Equip Helmet",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "toggleHelmetState",
        "label": "Default Movement Speed Increase",
        "category": "ItemActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "visor_next_mode",
        "label": "Visor Next Mode",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "visor_prev_mode",
        "label": "Visor Prev Mode",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "visor_wipe",
        "label": "Wipe Helmet Visor",
        "category": "PlayerActions",
        "description": "Quickly wipe your helmet visor to improve visibility",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "selectitem",
        "label": "Selectitem",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "cancelselect",
        "label": "Cancelselect",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "thirdperson",
        "label": "Third Person View (Toggle)",
        "category": "Player",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "toggle_cursor_input",
        "label": "Toggle Cursor Input",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "free_thirdperson_camera",
        "label": "Free View Camera (Hold)",
        "category": "Player",
        "description": "Holding allows free view camera in third person",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "pan_thirdperson_up",
        "label": "Pan Thirdperson Up",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pan_thirdperson_down",
        "label": "Pan Thirdperson Down",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "zoom_out",
        "label": "Zoom Out",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "zoom_in",
        "label": "Zoom In",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "break_conversation_effects",
        "label": "Break Conversation Effects",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hmd_rotateyaw",
        "label": "Hmd Rotateyaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hmd_rotatepitch",
        "label": "Hmd Rotatepitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hmd_rotateroll",
        "label": "Hmd Rotateroll",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mobiglas",
        "label": "mobiGlas (Toggle)",
        "category": "MobiGlasActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ship_recall",
        "label": "Recall Last Vehicle",
        "category": "MobiGlasActions",
        "description": "Activate ship recall on the last flying vehicle used",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pl_hud_open_scoreboard",
        "label": "Scoreboard",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pl_hud_confirm",
        "label": "Pl Hud Confirm",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "toggle_ar_mode",
        "label": "Toggle Ar Mode",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ar_mode_scroll_action_up",
        "label": "Ar Mode Scroll Action Up",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ar_mode_scroll_action_down",
        "label": "Ar Mode Scroll Action Down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "shop_camera_zoom_in",
        "label": "Shop Camera Zoom In",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "shop_camera_zoom_out",
        "label": "Shop Camera Zoom Out",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "shop_camera_mouseyaw",
        "label": "Shop Camera Mouseyaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "shop_camera_mousepitch",
        "label": "Shop Camera Mousepitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_enterpuremode",
        "label": "Spectate Enterpuremode",
        "category": "Player",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "dismiss_corpse_marker",
        "label": "Dismiss Corpse Marker",
        "category": "PlayerActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "consume",
        "label": "Firearm - Attack",
        "category": "Player",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_select",
        "label": "Ui 3d Display Select",
        "category": "Player",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_reorient",
        "label": "Ui 3d Display Reorient",
        "category": "Player",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_center",
        "label": "Ui 3d Display Center",
        "category": "Player",
        "defaultActivationMode": "double_tap_nonblocking",
        "defaultMultiTap": 2
      },
      {
        "name": "ui_3d_display_decenter",
        "label": "Ui 3d Display Decenter",
        "category": "Player",
        "defaultActivationMode": "double_tap_nonblocking",
        "defaultMultiTap": 2
      },
      {
        "name": "ui_3d_display_zoom_out_button",
        "label": "Ui 3d Display Zoom Out Button",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_in_button",
        "label": "Ui 3d Display Zoom In Button",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_in_analog",
        "label": "Ui 3d Display Zoom In Analog",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_out_analog",
        "label": "Ui 3d Display Zoom Out Analog",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_out_wheel",
        "label": "Ui 3d Display Zoom Out Wheel",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_in_wheel",
        "label": "Ui 3d Display Zoom In Wheel",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_pan_toggle",
        "label": "Ui 3d Display Pan Toggle",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_rotate_toggle",
        "label": "Ui 3d Display Rotate Toggle",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_toggle",
        "label": "Ui 3d Display Zoom Toggle",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledPanX",
        "label": "Ui 3d Display ToggledPanX",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledPanY",
        "label": "Ui 3d Display ToggledPanY",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledYaw",
        "label": "Ui 3d Display ToggledYaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledPitch",
        "label": "Ui 3d Display ToggledPitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledZoom",
        "label": "Ui 3d Display ToggledZoom",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPanUp",
        "label": "Ui 3d Display NonToggledPanUp",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPanDown",
        "label": "Ui 3d Display NonToggledPanDown",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPanLeft",
        "label": "Ui 3d Display NonToggledPanLeft",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPanRight",
        "label": "Ui 3d Display NonToggledPanRight",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledYawUp",
        "label": "Ui 3d Display NonToggledYawUp",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledYawDown",
        "label": "Ui 3d Display NonToggledYawDown",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPitchLeft",
        "label": "Ui 3d Display NonToggledPitchLeft",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPitchRight",
        "label": "Ui 3d Display NonToggledPitchRight",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_pinMode",
        "label": "Ui 3d Display PinMode",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_pinSelect",
        "label": "Ui 3d Display PinSelect",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "port_modification_select",
        "label": "Port Modification Interact",
        "category": "Player",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_starmap",
        "label": "Map",
        "category": "MobiGlasActions",
        "description": "Map",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "force_respawn",
        "label": "Force Re-spawn (E.V.A. / On Foot)",
        "category": "PlayerActions",
        "defaultActivationMode": "delayed_press_medium",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option1",
        "label": "Pc Conversation Option1",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option2",
        "label": "Pc Conversation Option2",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option3",
        "label": "Pc Conversation Option3",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option4",
        "label": "Pc Conversation Option4",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option5",
        "label": "Pc Conversation Option5",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option_up",
        "label": "Pc Conversation Option Up",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option_down",
        "label": "Pc Conversation Option Down",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option_select",
        "label": "Pc Conversation Option Select",
        "category": "Player",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      }
    ]
  },
  "player_choice": {
    "mapName": "player_choice",
    "label": "Quick Keys, Interactions, and Inner Thought",
    "domain": "onfoot",
    "actions": [
      {
        "name": "pc_item_primary",
        "label": "Pc Item Primary",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_item_secondary",
        "label": "Pc Item Secondary",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_interaction_mode",
        "label": "Interaction Mode",
        "category": "Player Choice",
        "description": "Interaction Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_interaction_select",
        "label": "Activate Inner Thought",
        "category": "Player Choice",
        "description": "Activate Interaction",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_select",
        "label": "Activate Inner Thought",
        "category": "Player Choice",
        "description": "Activate Interaction",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_focus",
        "label": "Focus",
        "category": "Player Choice",
        "description": "Focus",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_zoom_in",
        "label": "Interaction Mode Zoom In",
        "category": "Player Choice",
        "description": "Interaction Mode Zoom In",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_zoom_out",
        "label": "Interaction Mode Zoom Out",
        "category": "Player Choice",
        "description": "Interaction Mode Zoom Out",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_screen_focus_left",
        "label": "MFD Left",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_screen_focus_right",
        "label": "MFD Right",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_screen_focus_up",
        "label": "MFD Up",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_screen_focus_down",
        "label": "MFD Down",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_personal_thought",
        "label": "Personal Inner Thought (PIT)",
        "category": "Player Choice",
        "description": "Personal Inner Thought",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_camera_orbit",
        "label": "Inventory Orbit Camera Mode",
        "category": "Player Choice",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_personal_back",
        "label": "Exit",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_ui_back",
        "label": "Pc Ui Back",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_inventory",
        "label": "Toggle Inventory (short press)",
        "category": "Player Choice",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_looting",
        "label": "Toogle Loot Screen (hold)",
        "category": "Player Choice",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_looting_toggle_view",
        "label": "Toggle Looting View",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_looting_toggle_weapon_attachments",
        "label": "Looting - Toggle Weapon Attachments",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_item_unstown",
        "label": "Pc Pit Item Unstown",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_item_drop",
        "label": "Drop Item",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_empty_backpack",
        "label": "Store All Commodities",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_player_actions",
        "label": "Player Actions - PIT Category",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_emotes",
        "label": "Emotes - PIT Category",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_ship_systems",
        "label": "Ship Systems - PIT Category",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_flight_systems",
        "label": "Flight Systems - PIT Category",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_vehicle_actions",
        "label": "Vehicle Actions - PIT Category",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_weapons_systems",
        "label": "Weapon Systems - PIT Category",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_remote_turrets",
        "label": "Remote Turret - PIT Category",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_item_actions",
        "label": "Item Actions - PIT Category",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_weapon_selection",
        "label": "Weapon Selection - PIT Category",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_mobiglas_actions",
        "label": "Mobiglas Actions - PIT Category",
        "category": "Player Choice",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_pit_miningmode_actions",
        "label": "Mining Mode Actions - PIT Category",
        "category": "Mining Operations",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_qs_weapons_pit_primary",
        "label": "Weapon Select Radial Menu",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_qs_weapons_pit_secondary",
        "label": "Weapon Select Radial Menu",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_qs_weapons_pit_sidearm",
        "label": "Weapon Select Radial Menu",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_qs_grenades",
        "label": "Throwable Select Radial Menu",
        "category": "WeaponSelection",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_qs_consumables",
        "label": "Consumable Select Radial Menu",
        "category": "WeaponSelection",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      }
    ]
  },
  "player_emotes": {
    "mapName": "player_emotes",
    "label": "Social - Emotes",
    "domain": "onfoot",
    "actions": [
      {
        "name": "emote_cs_forward",
        "label": "Forward",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_cs_left",
        "label": "Left",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_cs_right",
        "label": "Right",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_cs_stop",
        "label": "Stop",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_cs_yes",
        "label": "Yes",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_cs_no",
        "label": "No",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_agree",
        "label": "Agree",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_angry",
        "label": "Angry",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_atease",
        "label": "At Ease",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_attention",
        "label": "Attention",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_blah",
        "label": "Blah",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_bored",
        "label": "Bored",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_bow",
        "label": "Bow",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_burp",
        "label": "Burp",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_cheer",
        "label": "Cheer",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_chicken",
        "label": "Chicken",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_clap",
        "label": "Clap",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_come",
        "label": "Come",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_cry",
        "label": "Cry",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_dance",
        "label": "Dance",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_disagree",
        "label": "Disagree",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_failure",
        "label": "Failure",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_flex",
        "label": "Flex",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_flirt",
        "label": "Flirt",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_gasp",
        "label": "Gasp",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_gloat",
        "label": "Gloat",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_greet",
        "label": "Greet",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_laugh",
        "label": "Laugh",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_launch",
        "label": "Confirm Launch",
        "category": "Emotes",
        "description": "Confirms the launch of the vehicle",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_point",
        "label": "Point",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_rude",
        "label": "Rude",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_salute",
        "label": "Salute",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_sit",
        "label": "Sit",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_sleep",
        "label": "Sleep",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_smell",
        "label": "Smell",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_taunt",
        "label": "Taunt",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_threaten",
        "label": "Threaten",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_wait",
        "label": "Wait",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_wave",
        "label": "Wave",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "emote_whistle",
        "label": "Whistle",
        "category": "Emotes",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "player_input_optical_tracking": {
    "mapName": "player_input_optical_tracking",
    "label": "VOIP, FOIP and Head Tracking",
    "domain": "onfoot",
    "actions": [
      {
        "name": "hmd_toggle",
        "label": "[Experimental] VR - Toggle On / Off",
        "category": "Player Input Optical Tracking",
        "description": "Enables/disables VR gameplay",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hmd_recenter",
        "label": "[Experimental] VR - Recenter Device",
        "category": "Player Input Optical Tracking",
        "description": "Recenters the VR headset",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hmd_theater_mode_toggle",
        "label": "[Experimental] VR - Toggle Theater Mode",
        "category": "Player Input Optical Tracking",
        "description": "Enables / Disables Theater Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "hmd_lens_display_toggle",
        "label": "[Experimental] VR - Visor Toggle On / Off",
        "category": "Player Input Optical Tracking",
        "description": "Enables / Disables the Visor",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "headtrack_enabled",
        "label": "Enable Head Tracking (Toggle)",
        "category": "Player Input Optical Tracking",
        "description": "Switches head tracking on / off (Toggle)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "headtrack_hold",
        "label": "Head Tracking (Hold)",
        "category": "Player Input Optical Tracking",
        "description": "Enables head tracking as long as the button is held down",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "headtrack_recenter_device",
        "label": "Recenter Head Tracking Device (except TrackIR)",
        "category": "Player Input Optical Tracking",
        "description": "Recenters head tracking device inputs.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "headtrack_camera_enabled",
        "label": "Enable / Disable Head Tracking for 3rd Person Camera (Toggle)",
        "category": "Player Input Optical Tracking",
        "description": "Enables or disables head tracking in external cameras.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "foip_pushtotalk",
        "label": "VOIP Push To Talk",
        "category": "Player Input Optical Tracking",
        "description": "VOIP Push To Talk",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "foip_pushtotalk_proximity",
        "label": "VOIP Push To Talk (Proximity only)",
        "category": "Player Input Optical Tracking",
        "description": "VOIP Push To Talk (Proximity only)",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "foip_viewownplayer",
        "label": "FOIP Selfie Cam",
        "category": "Player Input Optical Tracking",
        "description": "FOIP Selfie Cam",
        "defaultActivationMode": "delayed_hold",
        "defaultMultiTap": 1
      },
      {
        "name": "foip_recalibrate",
        "label": "FOIP Recalibrate",
        "category": "Player Input Optical Tracking",
        "description": "FOIP Recalibrate",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "foip_cyclechannel",
        "label": "Cycle through audio channels",
        "category": "Player Input Optical Tracking",
        "description": "Cycle through audio channels",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "prone": {
    "mapName": "prone",
    "label": "On Foot - All",
    "domain": "onfoot",
    "actions": [
      {
        "name": "prone_rollleft",
        "label": "Roll Left (while Prone)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "prone_rollright",
        "label": "Roll Right (while Prone)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "seat_general": {
    "mapName": "seat_general",
    "label": "Vehicles - Seats and Operator Modes",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_emergency_exit",
        "label": "Emergency Exit Seat",
        "category": "Seat \u0026 Access",
        "description": "Press LShift + H to engage emergency exit",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_eject",
        "label": "Eject",
        "category": "PlayerActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_look_behind",
        "label": "Look behind",
        "category": "Seat General",
        "defaultActivationMode": "delayed_hold_no_retrigger",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_mining_mode",
        "label": "Toggle Mining Operator Mode",
        "category": "ShipSystems",
        "description": "Mining Mode Toggle",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_salvage_mode",
        "label": "Toggle Salvage Operator Mode",
        "category": "ShipSystems",
        "description": "Activate salvage mode when seated.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_refuel_mode",
        "label": "Toggle Refuel Operator Mode",
        "category": "ShipSystems",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_scan_mode",
        "label": "Toggle Scanning Operator Mode",
        "category": "ShipSystems",
        "description": "Scanning Mode Toggle",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_quantum_mode",
        "label": "Toggle Quantum Operator Mode",
        "category": "ShipSystems",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "NAV"
      },
      {
        "name": "v_toggle_missile_mode",
        "label": "Toggle Missile Operator Mode",
        "category": "ShipSystems",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_guns_mode",
        "label": "Toggle Guns Operator Mode",
        "category": "ShipSystems",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_flight_mode",
        "label": "Toggle Flight Operator Mode",
        "category": "ShipSystems",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_set_mining_mode",
        "label": "Set Mining Operator Mode",
        "category": "Mining Operations",
        "description": "Set Mining Operator Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_set_salvage_mode",
        "label": "Set Salvage Operator Mode",
        "category": "Salvage Operations",
        "description": "Set Salvage Operator Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_set_refuel_mode",
        "label": "Set Refuel Operator Mode",
        "category": "Seat General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_set_scan_mode",
        "label": "Set Scanning Operator Mode",
        "category": "Scanning",
        "description": "Set Scanning Operator Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_set_quantum_mode",
        "label": "Set Quantum Operator Mode",
        "category": "Quantum Travel",
        "description": "Set Quantum Operator Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_set_missile_mode",
        "label": "Set Missile Operator Mode",
        "category": "Missile Systems",
        "description": "Set Missile Operator Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_set_guns_mode",
        "label": "Set Guns Operator Mode",
        "category": "Seat General",
        "description": "Set Guns Operator Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_set_flight_mode",
        "label": "Set Flight Operator Mode",
        "category": "Seat General",
        "description": "Set Flight Operator Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_enter_remote_turret_1",
        "label": "Enter Remote Turret 1",
        "category": "RemoteTurret",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_enter_remote_turret_2",
        "label": "Enter Remote Turret 2",
        "category": "RemoteTurret",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_enter_remote_turret_3",
        "label": "Enter Remote Turret 3",
        "category": "RemoteTurret",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_operator_mode_cycle_forward",
        "label": "Next Operator Mode",
        "category": "ShipSystems",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_operator_mode_cycle_back",
        "label": "Previous Operator Mode",
        "category": "ShipSystems",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_light_amplification_toggle",
        "label": "Light Amplification Toggle",
        "category": "Seat General",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_light_amplification_on",
        "label": "Light Amplification On",
        "category": "Seat General",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_light_amplification_off",
        "label": "Light Amplification Off",
        "category": "Seat General",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      }
    ]
  },
  "server_renderer": {
    "mapName": "server_renderer",
    "label": "Server Renderer",
    "domain": "general",
    "actions": [
      {
        "name": "v_view_cycle_fwd",
        "label": "View Cycle Fwd",
        "category": "Server Renderer",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_auto_weapons": {
    "mapName": "spaceship_auto_weapons",
    "label": "Spaceship Auto Weapons",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_weapon_toggle_ai",
        "label": "Weapon Toggle Ai",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_defensive": {
    "mapName": "spaceship_defensive",
    "label": "Vehicles - Shields and Countermeasures",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_weapon_countermeasure_decoy_launch",
        "label": "Decoy - Launch Burst (tap), Set and Launch Burst (hold)",
        "category": "Weapons \u0026 Combat",
        "description": "Launches a decoy countermeasure.",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_weapon_countermeasure_decoy_burst_increase",
        "label": "Decoy - Increase Burst Size (tap)",
        "category": "Weapons \u0026 Combat",
        "description": "Increases the burst size by one.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_weapon_countermeasure_decoy_burst_decrease",
        "label": "Decoy - Decrease Burst Size (tap)",
        "category": "Weapons \u0026 Combat",
        "description": "Decreases the burst size by one.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_weapon_countermeasure_decoy_launch_panic",
        "label": "Decoy - Panic Launch (tap)",
        "category": "Weapons \u0026 Combat",
        "description": "Launches a large percentage of the countermeasure magazine.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_weapon_countermeasure_noise_launch",
        "label": "Noise - Deploy (Tap)",
        "category": "Weapons \u0026 Combat",
        "description": "Deploys a noise countermeasure.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_shield_raise_level_forward",
        "label": "Shield raise level front",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_shield_raise_level_back",
        "label": "Shield raise level back",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_shield_raise_level_left",
        "label": "Shield raise level left",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_shield_raise_level_right",
        "label": "Shield raise level right",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_shield_raise_level_up",
        "label": "Shield raise level top",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_shield_raise_level_down",
        "label": "Shield raise level bottom",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_shield_reset_level",
        "label": "Shield reset levels",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_docking": {
    "mapName": "spaceship_docking",
    "label": "Flight - Docking",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_toggle_docking_request",
        "label": "Docking\\n(Initiate)",
        "category": "Spaceship Docking",
        "description": "Activate Docking Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_dock_toggle_view",
        "label": "Toggle Docking Camera",
        "category": "Spaceship Docking",
        "description": "Toggles the docking camera.",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_general": {
    "mapName": "spaceship_general",
    "label": "Vehicles - Cockpit",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_self_destruct",
        "label": "Self Destruct",
        "category": "ShipSystems",
        "defaultActivationMode": "delayed_press_medium",
        "defaultMultiTap": 1
      },
      {
        "name": "v_cooler_throttle_up",
        "label": "Increase Cooler Rate",
        "category": "Spaceship General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_cooler_throttle_down",
        "label": "Decrease Cooler Rate",
        "category": "Spaceship General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_enterpuremode",
        "label": "Spectate Enterpuremode",
        "category": "Spaceship General",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_flightready",
        "label": "Flight / Systems Ready",
        "category": "ShipSystems",
        "description": "Flight / Systems Ready",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_all_doors",
        "label": "Open/Close Doors (Toggle)",
        "category": "VehicleActions",
        "description": "Toggle Open/Close Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_open_all_doors",
        "label": "Open All Doors",
        "category": "Seat \u0026 Access",
        "description": "Open All Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_close_all_doors",
        "label": "Close All Doors",
        "category": "Seat \u0026 Access",
        "description": "Close All Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_all_doorlocks",
        "label": "Lock/Unlock Doors (Toggle)",
        "category": "VehicleActions",
        "description": "Toggle Lock/Unlock Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_lock_all_doors",
        "label": "Lock All Doors",
        "category": "Seat \u0026 Access",
        "description": "Lock All Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_unlock_all_doors",
        "label": "Unlock All Doors",
        "category": "Seat \u0026 Access",
        "description": "Unlock All Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_all_portlocks",
        "label": "Port Lock Toggle All",
        "category": "VehicleActions",
        "description": "Toggle Open/Close Ports",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_lock_all_ports",
        "label": "Port Lock All",
        "category": "Spaceship General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_unlock_all_ports",
        "label": "Port Unlock All",
        "category": "Spaceship General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option1",
        "label": "Pc Conversation Option1",
        "category": "Spaceship General",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option2",
        "label": "Pc Conversation Option2",
        "category": "Spaceship General",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option3",
        "label": "Pc Conversation Option3",
        "category": "Spaceship General",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option4",
        "label": "Pc Conversation Option4",
        "category": "Spaceship General",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "pc_conversation_option5",
        "label": "Pc Conversation Option5",
        "category": "Spaceship General",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_hud": {
    "mapName": "spaceship_hud",
    "label": "Flight - HUD",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_cycle_pitch_ladder_mode",
        "label": "Cycle Pitch Ladder Mode",
        "category": "VehicleActions",
        "description": "Cycles the pitch ladder mode between off, HUD, look direction and mixed.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mobiglas",
        "label": "mobiGlas (Toggle)",
        "category": "MobiGlasActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "toggle_ar_mode",
        "label": "Toggle Ar Mode",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_open_scoreboard",
        "label": "Scoreboard",
        "category": "Spaceship Hud",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_interact_toggle",
        "label": "Hud Interact Toggle",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_cycle_mode_fwd",
        "label": "Hud Cycle Mode Fwd",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_cycle_mode_back",
        "label": "Hud Cycle Mode Back",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_focused_cycle_mode_fwd",
        "label": "Hud Focused Cycle Mode Fwd",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_focused_cycle_mode_back",
        "label": "Hud Focused Cycle Mode Back",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_left_panel_up",
        "label": "Hud Left Panel Up",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_left_panel_down",
        "label": "Hud Left Panel Down",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_left_panel_left",
        "label": "Hud Left Panel Left",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_left_panel_right",
        "label": "Hud Left Panel Right",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_confirm",
        "label": "Hud Confirm",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_cancel",
        "label": "Hud Cancel",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_stick_x",
        "label": "Hud Stick X",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_hud_stick_y",
        "label": "Hud Stick Y",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_comm_open_chat",
        "label": "Comm Open Chat",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_comm_show_chat",
        "label": "Comm Show Chat",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_comm_open_precanned",
        "label": "Comm Open Precanned",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_comm_select_precanned_1",
        "label": "Comm Select Precanned 1",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_comm_select_precanned_2",
        "label": "Comm Select Precanned 2",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_comm_select_precanned_3",
        "label": "Comm Select Precanned 3",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_comm_select_precanned_4",
        "label": "Comm Select Precanned 4",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_comm_select_precanned_5",
        "label": "Comm Select Precanned 5",
        "category": "Spaceship Hud",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_starmap",
        "label": "Map",
        "category": "MobiGlasActions",
        "description": "Map",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "visor_wipe",
        "label": "Wipe Helmet Visor",
        "category": "PlayerActions",
        "description": "Quickly wipe your helmet visor to improve visibility",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_mining": {
    "mapName": "spaceship_mining",
    "label": "Vehicles - Mining",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_toggle_mining_laser_fire",
        "label": "Fire Mining Laser (Toggle)",
        "category": "Weapons \u0026 Combat",
        "description": "Fire Mining Laser (Toggle)",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_toggle_mining_laser_type",
        "label": "Switch Mining Laser (Toggle)",
        "category": "MiningMode",
        "description": "Switch Mining Laser (Toggle)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_increase_mining_throttle",
        "label": "Increase Mining Laser Power",
        "category": "Mining Operations",
        "description": "Increase Mining Laser Power",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_decrease_mining_throttle",
        "label": "Decrease Mining Laser Power",
        "category": "Mining Operations",
        "description": "Decrease Mining Laser Power",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_mining_throttle",
        "label": "Increase / Decrease Mining Laser Power",
        "category": "Mining Operations",
        "description": "Increase / Decrease Mining Laser Power",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_mining_use_consumable1",
        "label": "Activate Mining Module (Slot 1)",
        "category": "MiningMode",
        "description": "Activate a Mining Module",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_mining_use_consumable2",
        "label": "Activate Mining Module (Slot 2)",
        "category": "MiningMode",
        "description": "Activate a Mining Module",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_mining_use_consumable3",
        "label": "Activate Mining Module (Slot 3)",
        "category": "MiningMode",
        "description": "Activate a Mining Module",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_mining_use_permanent_modifier",
        "label": "Toggle Laser Beam (High / low)",
        "category": "MiningMode",
        "description": "Activate a Mining Module",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_jettison_volatile_cargo",
        "label": "Jettison Cargo",
        "category": "MiningMode",
        "description": "Jettison Cargo",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      }
    ]
  },
  "spaceship_missiles": {
    "mapName": "spaceship_missiles",
    "label": "Vehicles - Missiles",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_weapon_toggle_launch_missile",
        "label": "Launch Missiles (Tap)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_launch_missile",
        "label": "Launch Missiles (Hold)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_cycle_missile_fwd",
        "label": "Cycle Next Missile Type",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_cycle_missile_back",
        "label": "Cycle Previous Missile Type",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_increase_max_missiles",
        "label": "Increase Number of Armed Missiles",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_decrease_max_missiles",
        "label": "Decrease Number of Armed Missiles",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_reset_max_missiles",
        "label": "Reset Number of Armed Missiles",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_bombing_toggle_desired_impact_point",
        "label": "Bombs - Toggle Desired Impact Point (Tap)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_bombing_toggle_desired_impact_point_hold",
        "label": "Bombs - Toggle Desired Impact Point (Hold)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_bombing_hud_range_increase",
        "label": "Bombs - Increase HUD Range",
        "category": "Weapons \u0026 Combat",
        "description": "Increases range by one step in the bomb alignment HUD",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_bombing_hud_range_decrease",
        "label": "Bombs - Decrease HUD Range",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_bombing_hud_range_reset",
        "label": "Bombs - Reset HUD Range",
        "category": "Weapons \u0026 Combat",
        "description": "Resets to the default range in the bomb alignment HUD",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_launch_missile_cinematic",
        "label": "Enable Cinematic Camera (Toggle)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_launch_missile_cinematic_hold",
        "label": "Enable Cinematic Camera (Hold)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      }
    ]
  },
  "spaceship_movement": {
    "mapName": "spaceship_movement",
    "label": "Flight - Movement",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_pitch_up",
        "label": "Pitch up",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_pitch_down",
        "label": "Pitch down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_pitch",
        "label": "Pitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_pitch_mouse",
        "label": "Pitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_yaw_left",
        "label": "Yaw left",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_yaw_right",
        "label": "Yaw right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_yaw",
        "label": "Yaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_yaw_mouse",
        "label": "Yaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_roll_left",
        "label": "Roll left",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_roll_right",
        "label": "Roll right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_roll",
        "label": "Roll",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_roll_mouse",
        "label": "Roll",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_relative_mouse_mode",
        "label": "Cycle mouse mode (VJoy / Relative)",
        "category": "Spaceship Movement",
        "description": "Switches the mouse behavior for ship rotations between a relative (FPS style) and a Vjoy mode.",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_yaw_roll_swap",
        "label": "Swap Yaw / Roll (Toggle)",
        "category": "Flight Movement",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_up",
        "label": "Strafe up (abs.)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_down",
        "label": "Strafe down (abs.)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_vertical",
        "label": "Strafe up / down (abs.)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_left",
        "label": "Strafe left (abs.)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_right",
        "label": "Strafe right (abs.)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_lateral",
        "label": "Strafe left / right (abs.)",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_forward",
        "label": "Throttle - Increase",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_back",
        "label": "Throttle - Decrease",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_longitudinal",
        "label": "Throttle - Forward / Back",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_longitudinal_invert",
        "label": "Throttle - Forward / Back Invert",
        "category": "Flight Movement",
        "description": "Inverts Strafe Longitudinal Absolute Axis Half (Neutral - Backward)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_throttle_swap_mode",
        "label": "Throttle - Cruise Mode - Toggle",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_throttle_set_sticky",
        "label": "Throttle - Cruise Mode - Enable",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_throttle_set_normal",
        "label": "Throttle - Cruise Mode - Disable",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_trim_set_long",
        "label": "Throttle - Trim - Set (Long Press)",
        "category": "Flight Movement",
        "description": "Throttle - Trim - Set (Long Press)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_trim_set_short",
        "label": "Throttle - Trim - Set (Short Press)",
        "category": "Flight Movement",
        "description": "Throttle - Trim - Set (Short Press)",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_trim_set_100_long",
        "label": "Throttle - Trim - Set To 100% (Long Press)",
        "category": "Flight Movement",
        "description": "Throttle - Trim - Set To 100% (Long Press)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_trim_set_100_short",
        "label": "Throttle - Trim - Set To 100% (Short Press)",
        "category": "Flight Movement",
        "description": "Throttle - Trim - Set To 100% (Short Press)",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_trim_set_50_long",
        "label": "Throttle - Trim - Set To 50% (Long Press)",
        "category": "Flight Movement",
        "description": "Throttle - Trim - Set To 50% (Long Press)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_trim_set_50_short",
        "label": "Throttle - Trim - Set To 50% (Short Press)",
        "category": "Flight Movement",
        "description": "Throttle - Trim - Set To 50% (Short Press)",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_trim_reset_long",
        "label": "Throttle - Trim - Release (Long Press)",
        "category": "Flight Movement",
        "description": "Throttle - Trim - Release (Long Press)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_strafe_trim_reset_short",
        "label": "Throttle - Trim - Release (Short Press)",
        "category": "Flight Movement",
        "description": "Throttle - Trim - Release (Short Press)",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_vector_decoupling_toggle",
        "label": "Enable / Disable decoupled mode",
        "category": "FlightSystems",
        "description": "Switch between coupled or decoupled mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_vector_decoupling_on",
        "label": "Enable decoupled mode",
        "category": "FlightSystems",
        "description": "Enable decoupled mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_vector_decoupling_off",
        "label": "Disable decoupled mode",
        "category": "FlightSystems",
        "description": "Disable decoupled mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_afterburner",
        "label": "Boost",
        "category": "Spaceship Movement",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_speed_limiter_up",
        "label": "Speed Limiter - Increase (hold)",
        "category": "Spaceship Movement",
        "description": "Speed Limiter - Increase (hold)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_speed_limiter_down",
        "label": "Speed Limiter - Decrease (hold)",
        "category": "Spaceship Movement",
        "description": "Speed Limiter - Decrease (hold)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_speed_limiter_increment",
        "label": "Speed Limiter - Step Up (tap)",
        "category": "Spaceship Movement",
        "description": "Speed Limiter - Step Up (tap)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_speed_limiter_decrement",
        "label": "Speed Limiter - Step Down (tap)",
        "category": "Spaceship Movement",
        "description": "Speed Limiter - Step Down (tap)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_speed_limiter_rel",
        "label": "Speed Limiter (rel)",
        "category": "Spaceship Movement",
        "description": "Speed Limiter (rel)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_speed_limiter_abs",
        "label": "Speed Limiter (abs)",
        "category": "Spaceship Movement",
        "description": "Speed Limiter (abs)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_speed_limiter_toggle",
        "label": "Speed Limiter - Enable / Disable",
        "category": "Spaceship Movement",
        "description": "Speed Limiter - Enable / Disable",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_speed_limiter_on",
        "label": "Speed Limiter - Enable",
        "category": "Spaceship Movement",
        "description": "Speed Limiter - Enable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_speed_limiter_off",
        "label": "Speed Limiter - Disable",
        "category": "Spaceship Movement",
        "description": "Speed Limiter - Disable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_accel_range_up",
        "label": "Acceleration Limiter - Increase (hold)",
        "category": "Spaceship Movement",
        "description": "Acceleration Limiter - Increase (hold)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_accel_range_down",
        "label": "Acceleration Limiter - Decrease (hold)",
        "category": "Spaceship Movement",
        "description": "Acceleration Limiter - Decrease (hold)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_accel_range_increment",
        "label": "Acceleration Limiter - Step Up (tap)",
        "category": "Spaceship Movement",
        "description": "Acceleration Limiter - Step Up (tap)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_accel_range_decrement",
        "label": "Acceleration Limiter - Step Down (tap)",
        "category": "Spaceship Movement",
        "description": "Acceleration Limiter - Step Down (tap)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_accel_range_rel",
        "label": "Acceleration Limiter (rel)",
        "category": "Spaceship Movement",
        "description": "Acceleration Limiter (rel)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_accel_range_abs",
        "label": "Acceleration Limiter (abs)",
        "category": "Spaceship Movement",
        "description": "Acceleration Limiter (abs)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_space_brake",
        "label": "Spacebrake",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_lock_rotation",
        "label": "Lock Pitch / Yaw Movement (Toggle / Hold)",
        "category": "Spaceship Movement",
        "description": "While active no rotational inputs are allowed to your ship. This is useful for arresting movement when you lost control using a mouse.",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_gsafe_on",
        "label": "G-Force safety on",
        "category": "Spaceship Movement",
        "description": "G-Force safety on",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_gsafe_off",
        "label": "G-Force safety off",
        "category": "Spaceship Movement",
        "description": "G-Force safety off",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_toggle_gforce_safety",
        "label": "G-Force Safety On/Off (Toggle / Hold)",
        "category": "FlightSystems",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_toggle_esp",
        "label": "E.S.P. - Toggle On / Off (Press)",
        "category": "FlightSystems",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_esp_hold",
        "label": "E.S.P. - Enable Temporarily (Hold)",
        "category": "Spaceship Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_landing_system",
        "label": "Landing System (Toggle)",
        "category": "VehicleActions",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_deploy_landing_system",
        "label": "Landing System (Deploy)",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_retract_landing_system",
        "label": "Landing System (Retract)",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_vtol_toggle",
        "label": "Toggle VTOL",
        "category": "FlightSystems",
        "description": "Enable / Disable Vertical Take-Off and Landing",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_vtol_on",
        "label": "Enable VTOL",
        "category": "FlightSystems",
        "description": "Enable Vertical Take-Off and Landing",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_vtol_off",
        "label": "Disable VTOL",
        "category": "FlightSystems",
        "description": "Disable Vertical Take-Off and Landing",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_transform_deploy",
        "label": "Expand Configuration",
        "category": "FlightSystems",
        "description": "Expands the vehicle's configuration.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_transform_retract",
        "label": "Retract Configuration",
        "category": "FlightSystems",
        "description": "Retracts the vehicle's configuration.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_transform_cycle",
        "label": "Cycle Configuration",
        "category": "FlightSystems",
        "description": "Cycle between the vehicle's expanded and retracted configurations.",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_autoland",
        "label": "Autoland",
        "category": "FlightSystems",
        "description": "Activate Autoland",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_atc_request",
        "label": "Request Landing",
        "category": "FlightSystems",
        "description": "Contacts ATC and other landing services.",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_atc_loading_area_request",
        "label": "Request Cargo Loading",
        "category": "FlightSystems",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_master_mode_cycle",
        "label": "Cycle Master Mode (Short Press)",
        "category": "Spaceship Movement",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_master_mode_cycle_long",
        "label": "Cycle Master Mode (Long Press)",
        "category": "Spaceship Movement",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1,
        "masterFlightMode": "NAV"
      },
      {
        "name": "v_master_mode_set_nav",
        "label": "Set Master Mode to Nav",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "NAV"
      },
      {
        "name": "v_master_mode_set_scm",
        "label": "Set Master Mode to SCM",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_toggle_jump_request",
        "label": "Jump Drive - Request Jump",
        "category": "Spaceship Movement",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_gravity_compensation_toggle",
        "label": "IFCS - Gravity Compensation - Toggle",
        "category": "Spaceship Movement",
        "description": "IFCS - Gravity Compensation - Toggle",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_gravity_compensation_on",
        "label": "IFCS - Gravity Compensation - Enable",
        "category": "Spaceship Movement",
        "description": "IFCS - Gravity Compensation - Enable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_gravity_compensation_off",
        "label": "IFCS - Gravity Compensation - Disable",
        "category": "Spaceship Movement",
        "description": "IFCS - Gravity Compensation - Disable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_wind_compensation_toggle",
        "label": "IFCS - Wind Compensation - Toggle",
        "category": "Spaceship Movement",
        "description": "IFCS - Wind Compensation - Toggle",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_wind_compensation_on",
        "label": "IFCS - Wind Compensation - Enable",
        "category": "Spaceship Movement",
        "description": "IFCS - Wind Compensation - Enable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_wind_compensation_off",
        "label": "IFCS - Wind Compensation - Disable",
        "category": "Spaceship Movement",
        "description": "IFCS - Wind Compensation - Disable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_auto_precision_mode_toggle",
        "label": "Automatic Precision Mode - Toggle",
        "category": "FlightSystems",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_auto_precision_mode_on",
        "label": "Automatic Precision Mode - Enable",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_auto_precision_mode_off",
        "label": "Automatic Precision Mode - Disable",
        "category": "Spaceship Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_proximity_assist_toggle",
        "label": "IFCS - Proximity Assist - Toggle",
        "category": "FlightSystems",
        "description": "IFCS - Proximity Assist - Toggle",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_proximity_assist_on",
        "label": "IFCS - Proximity Assist - Enable",
        "category": "Spaceship Movement",
        "description": "IFCS - Proximity Assist - Enable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_proximity_assist_off",
        "label": "IFCS - Proximity Assist - Disable",
        "category": "Spaceship Movement",
        "description": "IFCS - Proximity Assist - Disable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_stability_toggle",
        "label": "IFCS - Stability - Toggle",
        "category": "Spaceship Movement",
        "description": "IFCS - Stability - Toggle",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_stability_on",
        "label": "IFCS - Stability - Enable",
        "category": "Spaceship Movement",
        "description": "IFCS - Stability - Enable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_stability_off",
        "label": "IFCS - Stability - Disable",
        "category": "Spaceship Movement",
        "description": "IFCS - Stability - Disable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_command_toggle",
        "label": "IFCS Command Behaviour Toggle",
        "category": "Spaceship Movement",
        "description": "IFCS Command Behaviour Toggle",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_command_on",
        "label": "IFCS Command Behaviour On",
        "category": "Spaceship Movement",
        "description": "IFCS Command Behaviour On",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_command_off",
        "label": "IFCS Command Behaviour Off",
        "category": "Spaceship Movement",
        "description": "IFCS Command Behaviour Off",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_core_toggle",
        "label": "IFCS - Core - Toggle On / Off",
        "category": "Spaceship Movement",
        "description": "IFCS - Core - Toggle On / Off",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_core_on",
        "label": "IFCS - Core - Enable",
        "category": "Spaceship Movement",
        "description": "IFCS - Core - Enable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_core_off",
        "label": "IFCS - Core - Disable",
        "category": "Spaceship Movement",
        "description": "IFCS - Core - Disable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ifcs_reset_gmeter_max",
        "label": "Reset Flight Accelerometer",
        "category": "Spaceship Movement",
        "description": "Resets the max endured Gs for the accelerometer.",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_flight_advanced_hud_toggle",
        "label": "Advanced HUD - Toggle",
        "category": "Spaceship Movement",
        "description": "Advanced HUD - Toggle",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_flight_advanced_hud_on",
        "label": "Advanced HUD - Enable",
        "category": "Spaceship Movement",
        "description": "Advanced HUD - Enable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_flight_advanced_hud_off",
        "label": "Advanced HUD - Disable",
        "category": "Spaceship Movement",
        "description": "Advanced HUD - Disable",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_power": {
    "mapName": "spaceship_power",
    "label": "Flight - Power",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_power_toggle",
        "label": "Toggle Power - All",
        "category": "ShipSystems",
        "description": "Toggle Power - All",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_set_on",
        "label": "Set Power On",
        "category": "ShipSystems",
        "description": "Set Power On",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_set_off",
        "label": "Set Power Off",
        "category": "ShipSystems",
        "description": "Set Power Off",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_toggle_thrusters",
        "label": "Toggle Power - Thrusters",
        "category": "ShipSystems",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_set_thrusters_on",
        "label": "Set Thrusters Power On",
        "category": "ShipSystems",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_set_thrusters_off",
        "label": "Set Thrusters Power Off",
        "category": "ShipSystems",
        "description": "Set Thrusters Power Off",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_toggle_shields",
        "label": "Toggle Power - Shields",
        "category": "ShipSystems",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_set_shields_on",
        "label": "Set Shields Power On",
        "category": "ShipSystems",
        "description": "Set Shields Power On",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_set_shields_off",
        "label": "Set Shields Power Off",
        "category": "ShipSystems",
        "description": "Set Shields Power Off",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_toggle_weapons",
        "label": "Toggle Power - Weapons",
        "category": "WeaponSystems",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_set_weapons_on",
        "label": "Set Weapons Power On",
        "category": "ShipSystems",
        "description": "Set Weapons Power On",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_set_weapons_off",
        "label": "Set Weapons Power Off",
        "category": "ShipSystems",
        "description": "Set Weapons Power Off",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_throttle_down",
        "label": "Decrease Throttle",
        "category": "Power Management",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_throttle_min",
        "label": "Decrease Throttle to Min",
        "category": "Power Management",
        "defaultActivationMode": "double_tap",
        "defaultMultiTap": 2
      },
      {
        "name": "v_power_throttle_up",
        "label": "Increase Throttle",
        "category": "Power Management",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_power_throttle_max",
        "label": "Increase Throttle to Max",
        "category": "Power Management",
        "defaultActivationMode": "double_tap",
        "defaultMultiTap": 2
      },
      {
        "name": "v_engineering_assignment_engine_increase",
        "label": "Engines - Increase (Tap)",
        "category": "Spaceship Power",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_engine_decrease",
        "label": "Engines - Decrease (Tap)",
        "category": "Spaceship Power",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_engine_max",
        "label": "Engines - Set to Max (Hold)",
        "category": "Spaceship Power",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_engine_min",
        "label": "Engines - Set to Min (Hold)",
        "category": "Spaceship Power",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_shields_increase",
        "label": "Shields - Increase (Tap)",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_shields_decrease",
        "label": "Shields - Decrease (Tap)",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_shields_max",
        "label": "Shields - Set to Max (Hold)",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_shields_min",
        "label": "Shields - Set to Min (Hold)",
        "category": "Defensive \u0026 Shields",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_weapons_increase",
        "label": "Weapons - Increase (Tap)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_weapons_decrease",
        "label": "Weapons - Decrease (Tap)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_weapons_max",
        "label": "Weapons - Set to Max (Hold)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_weapons_min",
        "label": "Weapons - Set to Min (Hold)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_engineering_assignment_reset",
        "label": "Reset Assignments",
        "category": "Spaceship Power",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_quantum": {
    "mapName": "spaceship_quantum",
    "label": "Flight - Quantum Travel",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_toggle_qdrive_engagement",
        "label": "Engage Quantum Drive (Hold)",
        "category": "ShipSystems",
        "description": "Engages the quantum drive.",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1,
        "masterFlightMode": "NAV"
      }
    ]
  },
  "spaceship_radar": {
    "mapName": "spaceship_radar",
    "label": "Flight - Radar",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_invoke_ping",
        "label": "Activate Ping (Hold \u0026 Release)",
        "category": "Targeting \u0026 Radar",
        "description": "Activates the Ping Wave",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_salvage": {
    "mapName": "spaceship_salvage",
    "label": "Vehicles - Salvage",
    "domain": "spaceship",
    "actions": [
      {
        "name": "tractor_beam_vehicle_increase_distance",
        "label": "Tractor Beam Vehicle- Increase Distance",
        "category": "Spaceship Salvage",
        "description": "Increases the target distance for an object controlled with the Vehicle Tractor Beam.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "tractor_beam_vehicle_decrease_distance",
        "label": "Tractor Beam Vehicle - Decrease Distance",
        "category": "Spaceship Salvage",
        "description": "Decreases the target distance for an object controlled with the Vehicle Tractor Beam.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_toggle_fire_focused",
        "label": "Toggle Fire Focused",
        "category": "Weapons \u0026 Combat",
        "description": "Toggle firing the Focused salvage tools",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_toggle_fire_left",
        "label": "Toggle Fire Left",
        "category": "Weapons \u0026 Combat",
        "description": "Toggle firing the Left salvage tool",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_toggle_fire_right",
        "label": "Toggle Fire Right",
        "category": "Weapons \u0026 Combat",
        "description": "Toggle firing the Right salvage tool",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_toggle_fire_fracture",
        "label": "Toggle Fire Fracture",
        "category": "Weapons \u0026 Combat",
        "description": "Toggle firing the Fracturing tool",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_toggle_fire_disintegrate",
        "label": "Toggle Fire Disintegrate",
        "category": "Weapons \u0026 Combat",
        "description": "Toggle firing the Disintegration tool",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_toggle_gimbal_mode",
        "label": "Salvage Mode Gimbal (Toggle)",
        "category": "Salvage Operations",
        "description": "Toggle between gimbled and fixed salvage targeting modes.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_reset_gimbal",
        "label": "Salvage Mode Gimbal Reset",
        "category": "Salvage Operations",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_increase_beam_spacing",
        "label": "Increase Beam Spacing",
        "category": "Salvage Operations",
        "description": "Increase the spacing between the Vulture's two salvage heads.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_decrease_beam_spacing",
        "label": "Decrease Beam Spacing",
        "category": "Salvage Operations",
        "description": "Decrease the spacing between the Vulture's two salvage heads.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_beam_spacing_rel",
        "label": "Relative Beam Spacing",
        "category": "Salvage Operations",
        "description": "Adjust the relative spacing between the Vulture's two salvage heads.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_beam_spacing_abs",
        "label": "Absolute Beam Spacing",
        "category": "Salvage Operations",
        "description": "Adjust the absolute spacing between the Vulture's two salvage heads.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_toggle_beam_spacing_axis",
        "label": "Salvage Beam Axis (Toggle)",
        "category": "Salvage Operations",
        "description": "Set the orientation axis of the salvage beam to vertical or horizontal.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_cycle_modifiers_focused",
        "label": "Cycle Focused Salvage Modifiers",
        "category": "Salvage Operations",
        "description": "Cycle through available modifiers on the Focused salvage head(s)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_cycle_modifiers_left",
        "label": "Cycle Left Salvage Modifiers",
        "category": "Salvage Operations",
        "description": "Cycle through available modifiers on the left salvage head or salvage turret.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_cycle_modifiers_right",
        "label": "Cycle Right Salvage Modifiers",
        "category": "Salvage Operations",
        "description": "Cycle through available modifiers on the right salvage head or salvage turret.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_cycle_modifiers_structural",
        "label": "Cycle Structural Salvage Modes",
        "category": "Salvage Operations",
        "description": "Cycle through available modes on the Structural Salvage tool.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_focus_all_heads",
        "label": "Focus all salvage heads",
        "category": "Salvage Operations",
        "description": "Focus all salvage heads",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_focus_left",
        "label": "Focus left salvage head",
        "category": "Salvage Operations",
        "description": "Focus left salvage head",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_focus_right",
        "label": "Focus right salvage head",
        "category": "Salvage Operations",
        "description": "Focus right salvage head",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_focus_fracture",
        "label": "Focus Fracture tool",
        "category": "Salvage Operations",
        "description": "Focus Fracture tool",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_focus_disintegrate",
        "label": "Focus Disintegration tool",
        "category": "Salvage Operations",
        "description": "Focus Disintegration tool",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_nudge_up__left",
        "label": "Nudge left salvage tool up",
        "category": "Salvage Operations",
        "description": "Nudge left salvage tool up",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_nudge_down__left",
        "label": "Nudge left salvage tool down",
        "category": "Salvage Operations",
        "description": "Nudge left salvage tool down",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_nudge_left__left",
        "label": "Nudge left salvage tool left",
        "category": "Salvage Operations",
        "description": "Nudge left salvage tool left",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_nudge_right__left",
        "label": "Nudge left salvage tool right",
        "category": "Salvage Operations",
        "description": "Nudge left salvage tool right",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_nudge_up__right",
        "label": "Nudge right salvage tool up",
        "category": "Salvage Operations",
        "description": "Nudge right salvage tool up",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_nudge_down__right",
        "label": "Nudge right salvage tool down",
        "category": "Salvage Operations",
        "description": "Nudge right salvage tool down",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_nudge_left__right",
        "label": "Nudge right salvage tool left",
        "category": "Salvage Operations",
        "description": "Nudge right salvage tool left",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_salvage_nudge_right__right",
        "label": "Nudge right salvage tool right",
        "category": "Salvage Operations",
        "description": "Nudge right salvage tool right",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      }
    ]
  },
  "spaceship_scanning": {
    "mapName": "spaceship_scanning",
    "label": "Vehicles - Scanning",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_scanning_trigger_scan",
        "label": "Activate Scanning",
        "category": "Scanning",
        "description": "Activates the Scanning",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "v_inc_scan_focus_level",
        "label": "Increase Scanning Angle",
        "category": "Scanning",
        "description": "Increase the angle of the Scanning Cone",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_dec_scan_focus_level",
        "label": "Decrease Scanning Angle",
        "category": "Scanning",
        "description": "Decrease the angle of the Scanning Cone",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ui_prev_scan_tab",
        "label": "Ui Prev Scan Tab",
        "category": "Scanning",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ui_next_scan_tab",
        "label": "Ui Next Scan Tab",
        "category": "Scanning",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ui_prev_scan_page",
        "label": "Ui Prev Scan Page",
        "category": "Scanning",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ui_next_scan_page",
        "label": "Ui Next Scan Page",
        "category": "Scanning",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ui_prev_contact_page",
        "label": "Ui Prev Contact Page",
        "category": "Spaceship Scanning",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ui_next_contact_page",
        "label": "Ui Next Contact Page",
        "category": "Spaceship Scanning",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ui_prev_contact",
        "label": "Ui Prev Contact",
        "category": "Spaceship Scanning",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ui_next_contact",
        "label": "Ui Next Contact",
        "category": "Spaceship Scanning",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_target_hailing": {
    "mapName": "spaceship_target_hailing",
    "label": "Flight - Target Hailing",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_target_hail",
        "label": "Hail Target",
        "category": "Targeting \u0026 Radar",
        "description": "HailTarget",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_targeting": {
    "mapName": "spaceship_targeting",
    "label": "Vehicles - Targeting",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_auto_targeting_toggle_long",
        "label": "Auto Targeting - Toggle On/Off (Long Press)",
        "category": "Targeting \u0026 Radar",
        "description": "Auto Targeting - Toggle On/Off (Long Press)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_auto_targeting_toggle_short",
        "label": "Auto Targeting - Toggle On/Off (Short Press)",
        "category": "Targeting \u0026 Radar",
        "description": "Auto Targeting - Toggle On/Off (Short Press)",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_auto_targeting_enable_short",
        "label": "Auto Targeting - Toggle On (Short Press)",
        "category": "Targeting \u0026 Radar",
        "description": "Auto Targeting - Toggle On (Short Press)",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_auto_targeting_enable_long",
        "label": "Auto Targeting - Toggle On (Long Press)",
        "category": "Targeting \u0026 Radar",
        "description": "Auto Targeting - Toggle On (Long Press)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_auto_targeting_disable_short",
        "label": "Auto Targeting - Toggle Off (Short Press)",
        "category": "Targeting \u0026 Radar",
        "description": "Auto Targeting - Toggle Off (Short Press)",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_auto_targeting_disable_long",
        "label": "Auto Targeting - Toggle Off (Long Press)",
        "category": "Targeting \u0026 Radar",
        "description": "Auto Targeting - Toggle Off (Long Press)",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_toggle_lock_index_1",
        "label": "Pin Index 1 - Lock / Unlock Pinned Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_toggle_lock_index_2",
        "label": "Pin Index 2 - Lock / Unlock Pinned Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_toggle_lock_index_3",
        "label": "Pin Index 3 - Lock / Unlock Pinned Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_toggle_pin_index_1",
        "label": "Pin Index 1 - Pin / Unpin Selected Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_toggle_pin_index_2",
        "label": "Pin Index 2 - Pin / Unpin Selected Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_toggle_pin_index_3",
        "label": "Pin Index 3 - Pin / Unpin Selected Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_toggle_pin_index_1_hold",
        "label": "Pin Index 1 - Pin / Unpin Selected Target (Hold)",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_toggle_pin_index_2_hold",
        "label": "Pin Index 2 - Pin / Unpin Selected Target (Hold)",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_toggle_pin_index_3_hold",
        "label": "Pin Index 3 - Pin / Unpin Selected Target (Hold)",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_pin_selected",
        "label": "Pin Selected Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_unpin_selected",
        "label": "Unpin Selected Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_pin_selected_hold",
        "label": "Pin Selected Target (Hold)",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_unpin_selected_hold",
        "label": "Unpin Selected Target (Hold)",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_remove_all_pins",
        "label": "Remove All Pinned Targets",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_lock_selected",
        "label": "Lock Selected Target",
        "category": "Targeting \u0026 Radar",
        "description": "Lock Selected Target",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_unlock",
        "label": "Unlock Current Target",
        "category": "Targeting \u0026 Radar",
        "description": "Unlock Current Target",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_look_ahead_enable",
        "label": "Enable / Disable Look Ahead",
        "category": "Spaceship Targeting",
        "description": "Enables and disables Look Ahead Mode",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "v_look_ahead_start_target_tracking",
        "label": "Enable / Disable Target Padlock (Toggle, Hold)",
        "category": "Targeting \u0026 Radar",
        "description": "Allows you to track a locked target with your head",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_tracking_auto_zoom",
        "label": "Auto Zoom On Selected Target On / Off (Toggle, Hold)",
        "category": "Targeting \u0026 Radar",
        "description": "Allows you to enable and disable auto zoom on selected targets.",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_targeting_advanced": {
    "mapName": "spaceship_targeting_advanced",
    "label": "Vehicles - Target Cycling",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_target_under_reticle",
        "label": "Lock Target Under Reticle",
        "category": "Targeting \u0026 Radar",
        "description": "Lock Target Under Reticle",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_in_view_back",
        "label": "Cycle Lock - In View - Back",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_in_view_fwd",
        "label": "Cycle Lock - In View - Forward",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_in_view_reset",
        "label": "Cycle Lock - In View - Under Reticle",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_pinned_back",
        "label": "Cycle Lock - Pinned - Back",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_pinned_fwd",
        "label": "Cycle Lock - Pinned - Forward",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_pinned_reset",
        "label": "Cycle Lock - Pinned - Reset to First",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_attacker_back",
        "label": "Cycle Lock - Attackers - Back",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_attacker_fwd",
        "label": "Cycle Lock - Attackers - Forward",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_attacker_reset",
        "label": "Cycle Lock - Attackers - Reset to Closest",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_hostile_back",
        "label": "Cycle Lock - Hostiles - Back",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_hostile_fwd",
        "label": "Cycle Lock - Hostiles - Forward",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_hostile_reset",
        "label": "Cycle Lock - Hostiles - Reset to Closest",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_friendly_back",
        "label": "Cycle Lock - Friendlies - Back",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_friendly_fwd",
        "label": "Cycle Lock - Friendlies - Forward",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_friendly_reset",
        "label": "Cycle Lock - Friendlies - Reset to Closest",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_all_back",
        "label": "Cycle Lock - All - Back",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_all_fwd",
        "label": "Cycle Lock - All - Forward",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_all_reset",
        "label": "Cycle Lock - All - Reset to Closest",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_subitem_back",
        "label": "Cycle Lock - Sub-Target - Back",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_subitem_fwd",
        "label": "Cycle Lock - Sub-Target - Forward",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_target_cycle_subitem_reset",
        "label": "Cycle Lock - Sub-Target - Reset to Main Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_view": {
    "mapName": "spaceship_view",
    "label": "Vehicles - View",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_view_yaw_left",
        "label": "Look left",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_yaw_right",
        "label": "Look right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_yaw",
        "label": "Look left / right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_yaw_mouse",
        "label": "Look left / right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_yaw_absolute",
        "label": "View Yaw Absolute",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_pitch_up",
        "label": "Look up",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_pitch_down",
        "label": "Look down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_pitch",
        "label": "Look up / down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_pitch_mouse",
        "label": "Look up / down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_pitch_absolute",
        "label": "View Pitch Absolute",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_roll_absolute",
        "label": "View Roll Absolute",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_cycle_fwd",
        "label": "Cycle camera view",
        "category": "Spaceship View",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_cycle_internal_fwd",
        "label": "View Cycle Internal Fwd",
        "category": "Spaceship View",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_option",
        "label": "View Option",
        "category": "Spaceship View",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_mode",
        "label": "Cycle camera orbit mode",
        "category": "Spaceship View",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_zoom_in",
        "label": "Zoom in (3rd person view)",
        "category": "Spaceship View",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_zoom_out",
        "label": "Zoom out (3rd person view)",
        "category": "Spaceship View",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_interact",
        "label": "View Interact",
        "category": "Spaceship View",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_freelook_mode",
        "label": "Freelook (Hold)",
        "category": "Spaceship View",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_rel",
        "label": "Dynamic Zoom In and Out (rel.)",
        "category": "Spaceship View",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_rel_in",
        "label": "Dynamic Zoom In (rel.)",
        "category": "Spaceship View",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_rel_out",
        "label": "Dynamic Zoom Out (rel.)",
        "category": "Spaceship View",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_abs",
        "label": "Dynamic Zoom In and Out (abs.)",
        "category": "Spaceship View",
        "description": "Axis assignment for dynamic zoom",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_abs_toggle",
        "label": "Dynamic Zoom Toggle (abs.)",
        "category": "Spaceship View",
        "description": "Holds the dynamic zoom as long as the button is held",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ads_hold",
        "label": "Precision Targeting - Hold",
        "category": "Spaceship View",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ads_toggle",
        "label": "Precision Targeting - Toggle On / Off",
        "category": "Spaceship View",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ads_stable_max_zoom_hold",
        "label": "Precision Targeting - Maximum Zoom (hold)",
        "category": "Spaceship View",
        "defaultActivationMode": "delayed_hold",
        "defaultMultiTap": 1
      },
      {
        "name": "v_ads_cycle_tracking",
        "label": "Precision Targeting - Toggle Camera Tracking",
        "category": "Spaceship View",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      }
    ]
  },
  "spaceship_weapons": {
    "mapName": "spaceship_weapons",
    "label": "Vehicles - Weapons",
    "domain": "spaceship",
    "actions": [
      {
        "name": "v_attack_all",
        "label": "Attack All",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_attack_group1",
        "label": "Attack Group1",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_attack_group2",
        "label": "Attack Group2",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_gimbals_state_toggle",
        "label": "Gimbal State - Toggle Locked / Unlocked",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_gimbals_state_set_locked",
        "label": "Gimbal State - Set Locked",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_gimbals_state_set_unlocked",
        "label": "Gimbal State - Set Unlocked",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_gimbals_unlocked_cycle_source",
        "label": "Gimbal State - Unlocked - Cycle Source (VJoy / View)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_aim_type_cycle",
        "label": "Aim Mode - Cycle",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_aim_type_set_pip_aiming",
        "label": "Aim Mode - Set to PIP Aiming",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_aim_type_set_painting",
        "label": "Aim Mode - Set to Painting",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_aim_type_set_auto",
        "label": "Aim Mode - Set to Automatic",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_staggered_fire_toggle",
        "label": "Staggered Fire - Toggle On / Off",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_staggered_fire_on",
        "label": "Staggered Fire - On",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_staggered_fire_off",
        "label": "Staggered Fire - Off",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_suppress_aim_assists_hold",
        "label": "Suppress Aim Assists (Hold)",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_toggle_lead_lag",
        "label": "Toggle Lead / Lag PIPs",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_set_lag",
        "label": "Set Lag PIPs",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_set_lead",
        "label": "Set Lead PIPs",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_combination_type_toggle",
        "label": "PIP Combination Type: Toggle",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_combination_type_set_single",
        "label": "PIP Combination Type: Set One PIP Per Weapon",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_combination_type_set_combined_weapon_group",
        "label": "PIP Combination Type: Set One PIP Per Weapon Type",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_prec_line_toggle",
        "label": "PIP Precision Lines Toggle",
        "category": "WeaponSystems",
        "description": "PIP Precision Lines Toggle",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_prec_line_on",
        "label": "PIP Precision Lines On",
        "category": "Weapons \u0026 Combat",
        "description": "PIP Precision Lines On",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_prec_line_off",
        "label": "PIP Precision Lines Off",
        "category": "Weapons \u0026 Combat",
        "description": "PIP Precision Lines Off",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_fade_toggle",
        "label": "PIP Fading Toggle",
        "category": "WeaponSystems",
        "description": "PIP Fading Toggle",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_fade_on",
        "label": "PIP Fading On",
        "category": "Weapons \u0026 Combat",
        "description": "PIP Fading On",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_pip_fade_off",
        "label": "PIP Fading Off",
        "category": "Weapons \u0026 Combat",
        "description": "PIP Fading Off",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_ui_scale_toggle",
        "label": "Gunnery UI Magnification Toggle",
        "category": "WeaponSystems",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_ui_scale_on",
        "label": "Gunnery UI Magnification On",
        "category": "Weapons \u0026 Combat",
        "description": "Gunnery UI Magnification On",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_ui_scale_off",
        "label": "Gunnery UI Magnification Off",
        "category": "Weapons \u0026 Combat",
        "description": "Gunnery UI Magnification Off",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_convergence_distance_rel",
        "label": "Manual Convergence Distance (rel.)",
        "category": "Weapons \u0026 Combat",
        "description": "Sets the manual convergence distance on a relative axis",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_convergence_distance_rel_increase",
        "label": "Manual Convergence Distance - Increase",
        "category": "Weapons \u0026 Combat",
        "description": "Increases the Manual Convergence Distance",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_convergence_distance_rel_decrease",
        "label": "Manual Convergence Distance - Decrease",
        "category": "Weapons \u0026 Combat",
        "description": "Decreases the Manual Convergence Distance",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_convergence_distance_abs",
        "label": "Manual Convergence Distance (abs.)",
        "category": "Weapons \u0026 Combat",
        "description": "Manual Convergence Distance (abs.)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_convergence_distance_set_default",
        "label": "Manual Convergence Distance - Reset",
        "category": "Weapons \u0026 Combat",
        "description": "Resets the Manual Convergence Distance to the default value",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_attack",
        "label": "Weapon Preset - Fire",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_fire_guns0",
        "label": "Weapon Presets - Fire Guns Group 1",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Fire Guns Group 1",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_fire_guns1",
        "label": "Weapon Presets - Fire Guns Group 2",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Fire Guns Group 2",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_fire_guns2",
        "label": "Weapon Presets - Fire Guns Group 3",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Fire Guns Group 3",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_fire_guns3",
        "label": "Weapon Presets - Fire Guns Group 4",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Fire Guns Group 4",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_next",
        "label": "Weapon Presets - Next",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_prev",
        "label": "Weapon Presets - Previous",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_next_overflow",
        "label": "Weapon Presets - Next (Overflow)",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Next (Overflow)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_prev_overflow",
        "label": "Weapon Presets - Previous (Overflow)",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Previous (Overflow)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_guns0",
        "label": "Weapon Presets - Set Guns Group 1",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Set Guns Group 1",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_guns1",
        "label": "Weapon Presets - Set Guns Group 2",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Set Guns Group 2",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_guns2",
        "label": "Weapon Presets - Set Guns Group 3",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Set Guns Group 3",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_guns3",
        "label": "Weapon Presets - Set Guns Group 4",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Set Guns Group 4",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_emp",
        "label": "Weapon Presets - Set EMPs",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Set EMPs",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_qid_jammer",
        "label": "Weapon Presets - Set Quantum Jammers (short range)",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Set Quantum Jammers (short range)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_qid_pulse",
        "label": "Weapon Presets - Set Quantum Snares / Pulse (long range)",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Set Quantum Snares / Pulse (long range)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      },
      {
        "name": "v_weapon_preset_qid",
        "label": "Weapon Presets - Set QIDs",
        "category": "Weapons \u0026 Combat",
        "description": "Weapon Presets - Set QIDs",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1,
        "masterFlightMode": "SCM"
      }
    ]
  },
  "spectator": {
    "mapName": "spectator",
    "label": "Electronic Access - Spectator",
    "domain": "spectator",
    "actions": [
      {
        "name": "spectate_next_target",
        "label": "Spectator Camera Target (Next)",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_prev_target",
        "label": "Spectator Camera Target (Previous)",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_toggle_lock_target",
        "label": "Spectator Camera Lock Target",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_zoom",
        "label": "Spectator Camera Zoom",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_zoom_in",
        "label": "Spectator Camera Zoom In",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_zoom_out",
        "label": "Spectator Camera Zoom Out",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_rotateyaw_mouse",
        "label": "Spectator Camera Rotate Yaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_rotatepitch_mouse",
        "label": "Spectator Camera Rotate Pitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_rotateyaw",
        "label": "Spectator Camera Rotate Yaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_rotatepitch",
        "label": "Spectator Camera Rotate Pitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_toggle_hud",
        "label": "Spectator Camera HUD (Toggle)",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_gen_nextcamera",
        "label": "Spectate Gen Nextcamera",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_gen_nextmode",
        "label": "Spectator Camera Mode (Next)",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_gen_prevmode",
        "label": "Spectator Camera Mode (Previous)",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_moveleft",
        "label": "Spectate Moveleft",
        "category": "Spectator",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_moveright",
        "label": "Spectate Moveright",
        "category": "Spectator",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_moveforward",
        "label": "Spectate Moveforward",
        "category": "Spectator",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_moveback",
        "label": "Spectate Moveback",
        "category": "Spectator",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_moveup",
        "label": "Spectate Moveup",
        "category": "Spectator",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_movedown",
        "label": "Spectate Movedown",
        "category": "Spectator",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_freecam_sprint",
        "label": "Spectate Freecam Sprint",
        "category": "Spectator",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_toggle_freecam",
        "label": "Spectate Toggle Freecam",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_toggle_thirdperson",
        "label": "Spectate Toggle Thirdperson",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_roll_left",
        "label": "Spectate Roll Left",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_roll_right",
        "label": "Spectate Roll Right",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_speed_increment",
        "label": "Spectate Speed Increment",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_speed_decrement",
        "label": "Spectate Speed Decrement",
        "category": "Spectator",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "spectate_free_look",
        "label": "Spectate Free Look",
        "category": "Spectator",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      }
    ]
  },
  "stopwatch": {
    "mapName": "stopwatch",
    "label": "Stop Watch",
    "domain": "general",
    "actions": [
      {
        "name": "stopwatch_reset",
        "label": "Reset (Long Press)",
        "category": "VehicleActions",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "stopwatch_trigger",
        "label": "Start / Pause (Short Press)",
        "category": "VehicleActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "tractor_beam": {
    "mapName": "tractor_beam",
    "label": "On Foot - All",
    "domain": "general",
    "actions": [
      {
        "name": "tractor_beam_increase_distance",
        "label": "Tractor Beam - Increase Distance",
        "category": "Tractor Beam",
        "description": "Increases the target distance for an object controlled with the Tractor Beam.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "tractor_beam_decrease_distance",
        "label": "Tractor Beam - Decrease Distance",
        "category": "Tractor Beam",
        "description": "Decreases the target distance for an object controlled with the Tractor Beam.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "tractor_beam_rotate",
        "label": "Tractor Beam Rotate",
        "category": "Tractor Beam",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "tractor_beam_rotate_x",
        "label": "Tractor Beam Rotate X",
        "category": "Tractor Beam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "tractor_beam_rotate_y",
        "label": "Tractor Beam Rotate Y",
        "category": "Tractor Beam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "tractor_beam_rotate_z_up",
        "label": "Tractor Beam Rotate Z Up",
        "category": "Tractor Beam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "tractor_beam_rotate_z_down",
        "label": "Tractor Beam Rotate Z Down",
        "category": "Tractor Beam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "tractor_beam_detach",
        "label": "Tractor Beam Detach",
        "category": "Tractor Beam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "tractor_beam_throw",
        "label": "Tractor Beam Throw",
        "category": "Tractor Beam",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "tractor_beam_reset_rotation",
        "label": "Tractor Beam Reset Rotation",
        "category": "Tractor Beam",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "turret_advanced": {
    "mapName": "turret_advanced",
    "label": "Turret Advanced",
    "domain": "turret",
    "actions": [
      {
        "name": "turret_esp_toggle",
        "label": "Turret E.S.P. Toggle On / Off",
        "category": "Turret Advanced",
        "description": "Enables / Disables Turret E.S.P.",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_esp_hold",
        "label": "Turret E.S.P. - Enable Temporarily (Hold)",
        "category": "Turret Advanced",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_recenter",
        "label": "Recenter Turret (Hold)",
        "category": "Turret Advanced",
        "defaultActivationMode": "hold_no_retrigger",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_limiter_toggle",
        "label": "Turret - Speed Limiter - On/Off (Hold/Toggle)",
        "category": "Turret Advanced",
        "description": "Toggles the limiter for the rotational turret speed",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_limiter_rel",
        "label": "Turret - Speed Limiter (rel)",
        "category": "Turret Advanced",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_limiter_rel_increase",
        "label": "Turret - Speed Limiter - Increase (rel)",
        "category": "Turret Advanced",
        "description": "Increases the speed of the turret.",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_limiter_rel_decrease",
        "label": "Turret - Speed Limiter - Decrease (rel)",
        "category": "Turret Advanced",
        "description": "Decreases the speed of the turret.",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_limiter_abs",
        "label": "Turret - Speed Limiter (abs)",
        "category": "Turret Advanced",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_change_position",
        "label": "Change Turret Position",
        "category": "Turret Advanced",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "turret_movement": {
    "mapName": "turret_movement",
    "label": "Turret Movement",
    "domain": "turret",
    "actions": [
      {
        "name": "turret_pitch_up",
        "label": "Pitch up",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_pitch_down",
        "label": "Pitch down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_pitch",
        "label": "Pitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_pitch_mouse",
        "label": "Pitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_yaw_left",
        "label": "Yaw left",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_yaw_right",
        "label": "Yaw right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_yaw",
        "label": "Yaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_yaw_mouse",
        "label": "Yaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_toggle_mouse_mode",
        "label": "Toggle Turret Mouse Movement (VJoy, FPS style)",
        "category": "Turret Movement",
        "description": "Enables / Disables relative mouse mode for turrets",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_mouse_mode_cycle",
        "label": "Turret Mouse Mode - Cycle Modes",
        "category": "Turret Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_mouse_mode_set_vjoy",
        "label": "Turret Mouse Mode - VJoy Dragging",
        "category": "Turret Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_mouse_mode_set_1to1",
        "label": "Turret Mouse Mode - Relative Dragging",
        "category": "Turret Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_mouse_mode_set_pointer",
        "label": "Turret Mouse Mode - Pointer",
        "category": "Turret Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_remote_exit",
        "label": "Exit Remote Turret",
        "category": "Seat \u0026 Access",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_gyromode",
        "label": "Turret Gyro Stabilization (Toggle)",
        "category": "Turret Movement",
        "description": "Turret Gyro Stabilization (Toggle)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_remote_cycle_next",
        "label": "Next Remote Turret",
        "category": "Turret Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "turret_remote_cycle_prev",
        "label": "Previous Remote Turret",
        "category": "Turret Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "ui_notification": {
    "mapName": "ui_notification",
    "label": "Social - Invites",
    "domain": "general",
    "actions": [
      {
        "name": "ui_notification_accept",
        "label": "Accept Invite",
        "category": "Ui Notification",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_notification_decline",
        "label": "Reject Invite",
        "category": "Ui Notification",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_notification_ignore",
        "label": "Ignore Invite (hold)",
        "category": "Ui Notification",
        "description": "Ignore Invite",
        "defaultActivationMode": "delayed_hold",
        "defaultMultiTap": 1
      }
    ]
  },
  "ui_textfield": {
    "mapName": "ui_textfield",
    "label": "Ui Textfield",
    "domain": "general",
    "actions": [
      {
        "name": "ui_textfield_enter",
        "label": "Ui Textfield Enter",
        "category": "Ui Textfield",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_textfield_backspace",
        "label": "Ui Textfield Backspace",
        "category": "Ui Textfield",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_textfield_arrow_up",
        "label": "Ui Textfield Arrow Up",
        "category": "Ui Textfield",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_textfield_arrow_down",
        "label": "Ui Textfield Arrow Down",
        "category": "Ui Textfield",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_textfield_arrow_left",
        "label": "Ui Textfield Arrow Left",
        "category": "Ui Textfield",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_textfield_arrow_right",
        "label": "Ui Textfield Arrow Right",
        "category": "Ui Textfield",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "vehicle_driver": {
    "mapName": "vehicle_driver",
    "label": "Ground Vehicle - Movement",
    "domain": "ground_vehicle",
    "actions": [
      {
        "name": "v_move_forward",
        "label": "Drive Forward",
        "category": "Vehicle Driver",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_move_back",
        "label": "Drive Backward",
        "category": "Vehicle Driver",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_move",
        "label": "Drive Forward / Backward",
        "category": "Vehicle Driver",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_yaw_left",
        "label": "Turn Left",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_yaw_right",
        "label": "Turn Right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_yaw",
        "label": "Yaw Left / Right (Axis / HOTAS)",
        "category": "Flight Movement",
        "description": "Yaw Left / Right (HOTAS)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_yaw_mouse",
        "label": "Yaw Left / Right (Mouse)",
        "category": "Flight Movement",
        "description": "Yaw Left / Right (Mouse)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_pitch_up",
        "label": "Ground Vehicles - Pitch Up",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_pitch_down",
        "label": "Ground Vehicles - Pitch Down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_pitch",
        "label": "Pitch Up / Down (Axis / HOTAS)",
        "category": "Flight Movement",
        "description": "Pitch Up / Down (HOTAS)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_pitch_mouse",
        "label": "Pitch Up / Down (Mouse)",
        "category": "Flight Movement",
        "description": "Pitch Up / Down (Mouse)",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_brake",
        "label": "Brake",
        "category": "Vehicle Driver",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_rel",
        "label": "Dynamic Zoom In and Out (rel.)",
        "category": "Vehicle Driver",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_rel_in",
        "label": "Dynamic Zoom In (rel.)",
        "category": "Vehicle Driver",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_rel_out",
        "label": "Dynamic Zoom Out (rel.)",
        "category": "Vehicle Driver",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_abs",
        "label": "Dynamic Zoom In and Out (abs.)",
        "category": "Vehicle Driver",
        "description": "Axis assignment for dynamic zoom",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_dynamic_zoom_abs_toggle",
        "label": "Dynamic Zoom Toggle (abs.)",
        "category": "Vehicle Driver",
        "description": "Holds the dynamic zoom as long as the button is held",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "v_boost",
        "label": "Boost",
        "category": "Vehicle Driver",
        "defaultActivationMode": "all",
        "defaultMultiTap": 1
      },
      {
        "name": "v_lock_rotation",
        "label": "Lock Pitch / Yaw Movement (Toggle / Hold)",
        "category": "Vehicle Driver",
        "description": "While active no rotational inputs are allowed to your ship. This is useful for arresting movement when you lost control using a mouse.",
        "defaultActivationMode": "smart_toggle",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mgv_switch_brake_on_idle",
        "label": "Toggle Auto Braking On Idle",
        "category": "VehicleActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "vehicle_general": {
    "mapName": "vehicle_general",
    "label": "Ground Vehicle - General",
    "domain": "ground_vehicle",
    "actions": [
      {
        "name": "v_attack_all",
        "label": "Attack All",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_attack_group1",
        "label": "Attack Group1",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_attack_group2",
        "label": "Attack Group2",
        "category": "Weapons \u0026 Combat",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_horn",
        "label": "Horn",
        "category": "Vehicle General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_cycle_fwd",
        "label": "Cycle camera view",
        "category": "Vehicle General",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_option",
        "label": "View Option",
        "category": "Vehicle General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_zoom_in",
        "label": "Zoom in (3rd person view)",
        "category": "Vehicle General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_zoom_out",
        "label": "Zoom out (3rd person view)",
        "category": "Vehicle General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_yaw_mouse",
        "label": "Look left / right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_pitch_mouse",
        "label": "Look up / down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_yaw",
        "label": "Look left / right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_pitch",
        "label": "Look up / down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_freelook_mode",
        "label": "Freelook (Hold)",
        "category": "Vehicle General",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_cursor_input",
        "label": "Toggle Cursor Input",
        "category": "Vehicle General",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_yaw_absolute",
        "label": "View Yaw Absolute",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_pitch_absolute",
        "label": "View Pitch Absolute",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_view_roll_absolute",
        "label": "View Roll Absolute",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "mobiglas",
        "label": "mobiGlas (Toggle)",
        "category": "MobiGlasActions",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_flightready",
        "label": "Flight / Systems Ready",
        "category": "ShipSystems",
        "description": "Flight / Systems Ready",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_all_doors",
        "label": "Open/Close Doors (Toggle)",
        "category": "VehicleActions",
        "description": "Toggle Open/Close Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_open_all_doors",
        "label": "Open All Doors",
        "category": "Seat \u0026 Access",
        "description": "Open All Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_close_all_doors",
        "label": "Close All Doors",
        "category": "Seat \u0026 Access",
        "description": "Close All Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_all_doorlocks",
        "label": "Lock/Unlock Doors (Toggle)",
        "category": "Seat \u0026 Access",
        "description": "Toggle Lock/Unlock Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_lock_all_doors",
        "label": "Lock All Doors",
        "category": "Seat \u0026 Access",
        "description": "Lock All Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_unlock_all_doors",
        "label": "Unlock All Doors",
        "category": "Seat \u0026 Access",
        "description": "Unlock All Doors",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_toggle_all_portlocks",
        "label": "Port Lock Toggle All",
        "category": "VehicleActions",
        "description": "Toggle Open/Close Ports",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_lock_all_ports",
        "label": "Port Lock All",
        "category": "Vehicle General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_unlock_all_ports",
        "label": "Port Unlock All",
        "category": "Vehicle General",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_starmap",
        "label": "Map",
        "category": "MobiGlasActions",
        "description": "Map",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "visor_wipe",
        "label": "Wipe Helmet Visor",
        "category": "PlayerActions",
        "description": "Quickly wipe your helmet visor to improve visibility",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "vehicle_mfd": {
    "mapName": "vehicle_mfd",
    "label": "Vehicles - Multi Function Displays (MFDs)",
    "domain": "ground_vehicle",
    "actions": [
      {
        "name": "v_mfd_interact_cycle_forwards_short",
        "label": "MFD - Cycle Page - Forwards (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_interact_cycle_forwards_long",
        "label": "MFD - Cycle Page - Forwards (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_interact_cycle_backwards_short",
        "label": "MFD - Cycle Page - Backwards (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_interact_cycle_backwards_long",
        "label": "MFD - Cycle Page - Backwards (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_movement_up_short",
        "label": "MFD - Movement - Up (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_movement_up_long",
        "label": "MFD - Movement - Up (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_movement_down_short",
        "label": "MFD - Movement - Down (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_movement_down_long",
        "label": "MFD - Movement - Down (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_movement_left_short",
        "label": "MFD - Movement - Left (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_movement_left_long",
        "label": "MFD - Movement - Left (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_movement_right_short",
        "label": "MFD - Movement - Right (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_movement_right_long",
        "label": "MFD - Movement - Right (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_primary_short",
        "label": "MFD - Select - Primary (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_primary_long",
        "label": "MFD - Select - Primary (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_cast_left_short",
        "label": "MFD - Select - Left Cast (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_cast_left_long",
        "label": "MFD - Select - Left Cast (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_cast_right_short",
        "label": "MFD - Select - Right Cast (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_cast_right_long",
        "label": "MFD - Select - Right Cast (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_1_short",
        "label": "MFD - Select - MFD 1 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_1_long",
        "label": "MFD - Select - MFD 1 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_2_short",
        "label": "MFD - Select - MFD 2 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_2_long",
        "label": "MFD - Select - MFD 2 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_3_short",
        "label": "MFD - Select - MFD 3 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_3_long",
        "label": "MFD - Select - MFD 3 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_4_short",
        "label": "MFD - Select - MFD 4 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_4_long",
        "label": "MFD - Select - MFD 4 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_5_short",
        "label": "MFD - Select - MFD 5 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_5_long",
        "label": "MFD - Select - MFD 5 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_6_short",
        "label": "MFD - Select - MFD 6 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_6_long",
        "label": "MFD - Select - MFD 6 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_7_short",
        "label": "MFD - Select - MFD 7 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_7_long",
        "label": "MFD - Select - MFD 7 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_8_short",
        "label": "MFD - Select - MFD 8 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_8_long",
        "label": "MFD - Select - MFD 8 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_9_short",
        "label": "MFD - Select - MFD 9 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_9_long",
        "label": "MFD - Select - MFD 9 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_10_short",
        "label": "MFD - Select - MFD 10 (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_soft_select_mfd_10_long",
        "label": "MFD - Select - MDF 10 (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_quick_action_repair_all",
        "label": "MFD - Quick Action - Self Repair All",
        "category": "Vehicle Mfd",
        "description": "MFD - Activate self repair for all destroyed items where available",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_self_status_short",
        "label": "MFD - Set Page - Self Status (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_self_status_long",
        "label": "MFD - Set Page - Self Status (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_target_status_short",
        "label": "MFD - Set Page - Target Status (Short Press)",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_target_status_long",
        "label": "MFD - Set Page - Target Status (Long Press)",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_scanning_short",
        "label": "MFD - Set Page - Scanning (Short Press)",
        "category": "Scanning",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_scanning_long",
        "label": "MFD - Set Page - Scanning (Long Press)",
        "category": "Scanning",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_configuration_short",
        "label": "MFD - Set Page - Vehicle Configuration (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_configuration_long",
        "label": "MFD - Set Page - Vehicle Configuration (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_comms_short",
        "label": "MFD - Set Page - Communications (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_comms_long",
        "label": "MFD - Set Page - Communications (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_ifcs_short",
        "label": "MFD - Set Page - IFCS (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_ifcs_long",
        "label": "MFD - Set Page - IFCS (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_diagnostics_short",
        "label": "MFD - Set Page - Diagnostics (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_diagnostics_long",
        "label": "MFD - Set Page - Diagnostics (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_resource_network_short",
        "label": "MFD - Set Page - Resource Network (Short Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "v_mfd_select_view_resource_network_long",
        "label": "MFD - Set Page - Resource Network (Long Press)",
        "category": "Vehicle Mfd",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      }
    ]
  },
  "vehicle_mobiglas": {
    "mapName": "vehicle_mobiglas",
    "label": "Vehicle - Mobiglas",
    "domain": "ground_vehicle",
    "actions": [
      {
        "name": "ui_3d_display_select",
        "label": "Ui 3d Display Select",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_reorient",
        "label": "Ui 3d Display Reorient",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_center",
        "label": "Ui 3d Display Center",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "double_tap_nonblocking",
        "defaultMultiTap": 2
      },
      {
        "name": "ui_3d_display_decenter",
        "label": "Ui 3d Display Decenter",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "double_tap_nonblocking",
        "defaultMultiTap": 2
      },
      {
        "name": "ui_3d_display_zoom_out_button",
        "label": "Ui 3d Display Zoom Out Button",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_in_button",
        "label": "Ui 3d Display Zoom In Button",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_in_analog",
        "label": "Ui 3d Display Zoom In Analog",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_out_analog",
        "label": "Ui 3d Display Zoom Out Analog",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_out_wheel",
        "label": "Ui 3d Display Zoom Out Wheel",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_in_wheel",
        "label": "Ui 3d Display Zoom In Wheel",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_pan_toggle",
        "label": "Ui 3d Display Pan Toggle",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_rotate_toggle",
        "label": "Ui 3d Display Rotate Toggle",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_zoom_toggle",
        "label": "Ui 3d Display Zoom Toggle",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledPanX",
        "label": "Ui 3d Display ToggledPanX",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledPanY",
        "label": "Ui 3d Display ToggledPanY",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledYaw",
        "label": "Ui 3d Display ToggledYaw",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledPitch",
        "label": "Ui 3d Display ToggledPitch",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_toggledZoom",
        "label": "Ui 3d Display ToggledZoom",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPanUp",
        "label": "Ui 3d Display NonToggledPanUp",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPanDown",
        "label": "Ui 3d Display NonToggledPanDown",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPanLeft",
        "label": "Ui 3d Display NonToggledPanLeft",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPanRight",
        "label": "Ui 3d Display NonToggledPanRight",
        "category": "Vehicle Mobiglas",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledYawUp",
        "label": "Ui 3d Display NonToggledYawUp",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledYawDown",
        "label": "Ui 3d Display NonToggledYawDown",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPitchLeft",
        "label": "Ui 3d Display NonToggledPitchLeft",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_nonToggledPitchRight",
        "label": "Ui 3d Display NonToggledPitchRight",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_pinMode",
        "label": "Ui 3d Display PinMode",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "ui_3d_display_pinSelect",
        "label": "Ui 3d Display PinSelect",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      }
    ]
  },
  "view_director_mode": {
    "mapName": "view_director_mode",
    "label": "Camera - Advanced Camera Controls",
    "domain": "spectator",
    "actions": [
      {
        "name": "view_enable_camview_mode",
        "label": "Advanced Camera Controls Modifier (Hold)",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_switch_to_alternative",
        "label": "Advanced Camera Controls Modifier (Hold)",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_save_view_1",
        "label": "Save View 1",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_save_view_2",
        "label": "Save View 2",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_save_view_3",
        "label": "Save View 3",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_save_view_4",
        "label": "Save View 4",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_save_view_5",
        "label": "Save View 5",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_save_view_6",
        "label": "Save View 6",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_save_view_7",
        "label": "Save View 7",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_save_view_8",
        "label": "Save View 8",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_save_view_9",
        "label": "Save View 9",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_load_view_1",
        "label": "Load View 1",
        "category": "View Director Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "view_load_view_2",
        "label": "Load View 2",
        "category": "View Director Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "view_load_view_3",
        "label": "Load View 3",
        "category": "View Director Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "view_load_view_4",
        "label": "Load View 4",
        "category": "View Director Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "view_load_view_5",
        "label": "Load View 5",
        "category": "View Director Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "view_load_view_6",
        "label": "Load View 6",
        "category": "View Director Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "view_load_view_7",
        "label": "Load View 7",
        "category": "View Director Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "view_load_view_8",
        "label": "Load View 8",
        "category": "View Director Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "view_load_view_9",
        "label": "Load View 9",
        "category": "View Director Mode",
        "defaultActivationMode": "tap",
        "defaultMultiTap": 1
      },
      {
        "name": "view_reset_saved",
        "label": "Clear Saved View",
        "category": "View Director Mode",
        "defaultActivationMode": "delayed_press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_move_target_X_pos",
        "label": "X Offset Positive",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_move_target_X_neg",
        "label": "X Offset Negative",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_move_target_Y_pos",
        "label": "Y Offset Positive / Spectator Freecam Focal Point Forward",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_move_target_Y_neg",
        "label": "Y Offset Negative / Spectator Freecam Focal Point Backward",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_move_target_Z_pos",
        "label": "Z Offset Positive",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_move_target_Z_neg",
        "label": "Z Offset Negative",
        "category": "Targeting \u0026 Radar",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_fov_in",
        "label": "Increase FoV",
        "category": "View Director Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_fov_out",
        "label": "Decrease FoV",
        "category": "View Director Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_fstop_in",
        "label": "Increase DoF",
        "category": "View Director Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_fstop_out",
        "label": "Decrease DoF",
        "category": "View Director Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "view_restore_defaults",
        "label": "Reset Current View",
        "category": "View Director Mode",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  },
  "zero_gravity_eva": {
    "mapName": "zero_gravity_eva",
    "label": "E.V.A - All",
    "domain": "eva",
    "actions": [
      {
        "name": "eva_view_yaw_left",
        "label": "View Left",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_view_yaw_right",
        "label": "View Right",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_view_yaw",
        "label": "View Left/Right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_view_yaw_mouse",
        "label": "View Left/Right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_view_pitch_up",
        "label": "View Up",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_view_pitch_down",
        "label": "View Down",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_view_pitch",
        "label": "View Up/Down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_view_pitch_mouse",
        "label": "View Up/Down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_roll_left",
        "label": "Roll Left",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_roll_right",
        "label": "Roll Right",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_roll",
        "label": "Roll Left/Right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_strafe_up",
        "label": "Strafe Up",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_strafe_down",
        "label": "Strafe Down",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_strafe_vertical",
        "label": "Strafe Up/Down",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_strafe_left",
        "label": "Strafe Left",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_strafe_right",
        "label": "Strafe Right",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_strafe_lateral",
        "label": "Strafe Left/Right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_strafe_forward",
        "label": "Strafe Forward",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_strafe_back",
        "label": "Strafe Backward",
        "category": "Flight Movement",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_strafe_longitudinal",
        "label": "Strafe Forward/Backward",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_brake",
        "label": "Brake",
        "category": "Zero Gravity Eva",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_boost",
        "label": "Boost",
        "category": "Zero Gravity Eva",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "eva_toggle_headlook_mode",
        "label": "Freelook (Hold)",
        "category": "Zero Gravity Eva",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      }
    ]
  },
  "zero_gravity_traversal": {
    "mapName": "zero_gravity_traversal",
    "label": "E.V.A. - Zero-G Traversal",
    "domain": "eva",
    "actions": [
      {
        "name": "zgt_launch",
        "label": "Launch from Surface",
        "category": "Zero Gravity Traversal",
        "defaultActivationMode": "hold",
        "defaultMultiTap": 1
      },
      {
        "name": "zgt_detach",
        "label": "Detach from Surface",
        "category": "Zero Gravity Traversal",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "zgt_roll_left",
        "label": "Roll Left",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      },
      {
        "name": "zgt_roll_right",
        "label": "Roll Right",
        "category": "Flight Movement",
        "defaultActivationMode": "press",
        "defaultMultiTap": 1
      }
    ]
  }
}
;
