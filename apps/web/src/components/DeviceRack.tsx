import React, { useState } from 'react';
import type { JoystickDeviceOption } from '@sc-mapping/shared-types';
import { Gamepad2, ArrowRightLeft, CheckCircle, AlertTriangle, RotateCw, HelpCircle, X, Info } from 'lucide-react';

interface DeviceRackProps {
  devices: JoystickDeviceOption[];
  mapping: Map<number, number>;
  onMappingChange: (newMapping: Map<number, number>) => void;
  activeGamepadIds: string[];
  onOpenHardwareStudio?: () => void;
}

export const DeviceRack: React.FC<DeviceRackProps> = ({
  devices,
  mapping,
  onMappingChange,
  activeGamepadIds,
  onOpenHardwareStudio
}) => {
  const [draggedInstance, setDraggedInstance] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, instance: number) => {
    setDraggedInstance(instance);
    e.dataTransfer.setData('text/plain', instance.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetInstance: number) => {
    e.preventDefault();
    if (draggedInstance === null || draggedInstance === targetInstance) return;

    // Swap logical target instances
    const nextMapping = new Map(mapping);
    const sourceTarget = nextMapping.get(draggedInstance) ?? draggedInstance;
    const destTarget = nextMapping.get(targetInstance) ?? targetInstance;

    nextMapping.set(draggedInstance, destTarget);
    nextMapping.set(targetInstance, sourceTarget);

    onMappingChange(nextMapping);
    setDraggedInstance(null);
  };

  const handleReset = () => {
    const defaultMap = new Map<number, number>();
    devices.forEach(d => defaultMap.set(d.instance, d.instance));
    onMappingChange(defaultMap);
  };

  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-[#2d415f]">
        <div>
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-[#00f0ff]" />
            <h2 className="text-base text-[#e2e8f0] font-semibold tracking-wider">
              Hardware Device Rack & Logical Instance Remapper
            </h2>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="btn-help"
              title="Learn what the Device Rack does and how to re-index devices"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>What's this?</span>
            </button>
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Drag and drop controller cards to swap joystick IDs (<code className="text-[#00f0ff]">js1</code>, <code className="text-[#00f0ff]">js2</code>). Bypasses Windows DirectInput re-enumeration bugs and Star Citizen's 4-device console limitation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onOpenHardwareStudio && (
            <button
              onClick={onOpenHardwareStudio}
              className="text-xs text-[#00f0ff] hover:text-white bg-[rgba(0,240,255,0.1)] hover:bg-[rgba(0,240,255,0.2)] border border-[#00f0ff]/40 px-2.5 py-1 rounded flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(0,240,255,0.2)]"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              Hardware Studio & Presets
            </button>
          )}
          <button
            onClick={handleReset}
            className="text-xs text-[#8492a6] hover:text-[#00e5ff] flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-[#1e293b]"
            title="Reset device indices to default"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Reset Mapping
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(dev => {
          const targetInstance = mapping.get(dev.instance) ?? dev.instance;
          const isSwapped = targetInstance !== dev.instance;
          const inversionsCount = Object.keys(dev.inversions || {}).length;

          return (
            <div
              key={dev.instance}
              draggable
              onDragStart={(e) => handleDragStart(e, dev.instance)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dev.instance)}
              className={`p-4 rounded border transition-all cursor-grab active:cursor-grabbing ${
                isSwapped
                  ? 'border-[#ffaa00] bg-[rgba(255,170,0,0.08)]'
                  : 'border-[#2d415f] bg-[#0d131f] hover:border-[#00e5ff]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[rgba(0,229,255,0.15)] text-[#00e5ff] font-semibold">
                    XML ID: js{dev.instance}
                  </span>
                  {isSwapped && (
                    <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-[rgba(255,170,0,0.2)] text-[#ffaa00] font-bold">
                      → Export: js{targetInstance}
                    </span>
                  )}
                </div>
                <ArrowRightLeft className="w-4 h-4 text-[#8492a6]" />
              </div>

              <div className="text-sm font-semibold text-white truncate mb-1" title={dev.productName}>
                {dev.productName}
              </div>

              <div className="flex items-center gap-3 text-xs text-[#8492a6] mt-2">
                <span>Inversions: {inversionsCount}</span>
                {dev.productGuid && (
                  <span className="truncate max-w-[120px]" title={dev.productGuid}>
                    GUID: {dev.productGuid.slice(0, 8)}...
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {devices.length === 0 && (
          <div className="col-span-full p-6 text-center text-sm text-[#8492a6] border border-dashed border-[#2d415f] rounded">
            No joystick devices loaded. Import an <code className="text-[#00e5ff]">actionmaps.xml</code> file to populate hardware devices.
          </div>
        )}
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-xl p-6 border-[#00f0ff]/50 shadow-[0_0_30px_rgba(0,240,255,0.2)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2d415f]">
              <div className="flex items-center gap-2 text-[#00f0ff]">
                <Gamepad2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Device Rack & Logical Instance Remapping
                </h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-[#94a3b8] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#cbd5e1] leading-relaxed">
              <p>
                <strong>What problem does this solve?</strong> In Star Citizen, Windows DirectInput frequently re-orders physical USB flight sticks (e.g. your Right stick becomes <code className="text-[#00f0ff]">js2</code> and Left stick becomes <code className="text-[#00f0ff]">js1</code>) after a PC reboot or USB disconnect.
              </p>
              <ul className="space-y-2 list-disc pl-4 text-[11px] text-[#94a3b8]">
                <li>
                  <strong className="text-white">The Broken In-Game Command:</strong> The console command <code className="text-[#ffaa00]">pp_resortdevices</code> fails when more than 4 input devices are attached (e.g. dual sticks, rudder pedals, throttle quadrant, button box).
                </li>
                <li>
                  <strong className="text-white">Drag-and-Drop Instance Swapping:</strong> Simply drag any device card and drop it onto another. This swaps their logical IDs (<code className="text-[#00f0ff]">js1</code> ↔ <code className="text-[#00f0ff]">js2</code>).
                </li>
                <li>
                  <strong className="text-white">AST-Level XML Export:</strong> When you export your XML, the suite automatically rewrites all matching input prefixes (<code className="text-[#00f0ff]">js1_button4</code> → <code className="text-[#00f0ff]">js2_button4</code>) and updates the XML <code className="text-[#00f0ff]">&lt;options&gt;</code> blocks losslessly.
                </li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-1.5 rounded bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
