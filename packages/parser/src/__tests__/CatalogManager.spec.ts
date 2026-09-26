import { describe, it, expect } from 'vitest';
import { CatalogManager } from '../CatalogManager';
import { ActionMapsParser } from '../ActionMapsParser';

describe('CatalogManager', () => {
  const manager = new CatalogManager();

  it('should load default catalog with all primary Star Citizen action maps', () => {
    const maps = manager.getAllActionMaps();
    expect(maps.length).toBeGreaterThan(5);

    const flightMap = manager.getActionMap('spaceship_movement');
    expect(flightMap).toBeDefined();
    expect(flightMap?.label).toContain('Movement');

    const actions = manager.getAllActions();
    expect(actions.length).toBeGreaterThan(30);

    const ejectAction = actions.find(a => a.action.name === 'v_eject');
    expect(ejectAction).toBeDefined();
    expect(ejectAction?.action.label).toBe('Eject');
  });

  it('should search actions across action name, label, category, and description', () => {
    const ejectResults = manager.search('eject');
    expect(ejectResults.length).toBeGreaterThanOrEqual(1);
    expect(ejectResults.some(r => r.action.name === 'v_eject')).toBe(true);

    const salvageResults = manager.search('salvage');
    expect(salvageResults.length).toBeGreaterThanOrEqual(1);
    expect(salvageResults.some(r => r.action.name === 'v_toggle_salvage_mode')).toBe(true);
  });

  it('should identify unbound actions in a sparse profile document', () => {
    const sparseXml = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" profileName="sparse_test">
  <actionmap name="spaceship_movement">
    <action name="v_pitch">
      <rebind input="js1_pitch"/>
    </action>
  </actionmap>
</ActionMaps>`;

    const doc = ActionMapsParser.parseXML(sparseXml);
    const unbound = manager.getUnboundActions(doc);

    // v_pitch in spaceship_movement is bound, so it should NOT be in unbound for spaceship_movement
    expect(unbound.some(u => u.mapName === 'spaceship_movement' && u.actionName === 'v_pitch')).toBe(false);

    // v_eject is in seat_general in catalog but not in sparseXml, so it MUST be in unbound
    const ejectUnbound = unbound.find(u => u.actionName === 'v_eject');
    expect(ejectUnbound).toBeDefined();
    expect(ejectUnbound?.isBound).toBe(false);
    expect(ejectUnbound?.mapName).toBe('seat_general');
  });

  it('should filter unbound actions by mapName', () => {
    const doc = ActionMapsParser.parseXML('<ActionMaps version="1"/>');
    const weaponsUnbound = manager.getUnboundActions(doc, 'spaceship_weapons');

    expect(weaponsUnbound.length).toBeGreaterThan(0);
    expect(weaponsUnbound.every(u => u.mapName === 'spaceship_weapons')).toBe(true);
  });

  it('should create valid ActionBinding object', () => {
    const binding = manager.createActionBinding('v_ping', 'Radar Ping', [
      { input: 'js1_button5', devicePrefix: 'js1', hardwareKey: 'button5', bindType: 'rebind' }
    ]);
    expect(binding.name).toBe('v_ping');
    expect(binding.label).toBe('Radar Ping');
    expect(binding.inputs).toHaveLength(1);
  });

  it('should treat actions with only unbound placeholders (js2_, js3_, etc.) as unbound', () => {
    const placeholderXml = `<?xml version="1.0" encoding="utf-8"?>
<ActionMaps version="1" profileName="placeholder_test">
  <actionmap name="spaceship_movement">
    <action name="v_pitch">
      <rebind input="js1_pitch"/>
    </action>
    <action name="v_yaw">
      <rebind input="js2_ "/>
    </action>
    <action name="v_roll">
      <rebind input="js3_"/>
    </action>
  </actionmap>
</ActionMaps>`;

    const doc = ActionMapsParser.parseXML(placeholderXml);
    const unbound = manager.getUnboundActions(doc);

    // v_pitch is physically bound in spaceship_movement
    expect(unbound.some(u => u.mapName === 'spaceship_movement' && u.actionName === 'v_pitch')).toBe(false);

    // v_yaw only has js2_ placeholder, so MUST be identified as unbound
    const yawUnbound = unbound.find(u => u.mapName === 'spaceship_movement' && u.actionName === 'v_yaw');
    expect(yawUnbound).toBeDefined();
    expect(yawUnbound?.isBound).toBe(false);

    // v_roll only has js3_ placeholder, so MUST be identified as unbound
    const rollUnbound = unbound.find(u => u.mapName === 'spaceship_movement' && u.actionName === 'v_roll');
    expect(rollUnbound).toBeDefined();
    expect(rollUnbound?.isBound).toBe(false);
  });

  it('should expose static and instance lookups for game-extracted activation modes and flight modes', () => {
    // v_toggle_qdrive_engagement should be delayed_press and NAV mode
    expect(CatalogManager.getDefaultActivationMode('v_toggle_qdrive_engagement')).toBe('delayed_press');
    expect(CatalogManager.getMasterFlightMode('v_toggle_qdrive_engagement')).toBe('NAV');
    expect(manager.getDefaultActivationMode('v_toggle_qdrive_engagement')).toBe('delayed_press');

    // v_master_mode_cycle should be tap
    expect(CatalogManager.getDefaultActivationMode('v_master_mode_cycle')).toBe('tap');

    // v_eject should be press
    expect(CatalogManager.getDefaultActivationMode('v_eject')).toBe('press');
    expect(CatalogManager.getDefaultMultiTap('v_eject')).toBe(1);
  });
});
