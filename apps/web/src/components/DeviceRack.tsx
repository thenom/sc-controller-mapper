import React, { useState } from 'react';
import type { JoystickDeviceOption } from '@sc-mapping/shared-types';
import { Gamepad2, ArrowRightLeft, CheckCircle, AlertTriangle, RotateCw } from 'lucide-react';

interface DeviceRackProps {
  devices: JoystickDeviceOption[];
  mapping: Map<number, number>;
  onMappingChange: (newMapping: Map<number, number>) => void;
  activeGamepadIds: string[];
}

export const DeviceRack: React.FC<DeviceRackProps> = ({
  devices,
  mapping,
  onMappingChange,
  activeGamepadIds
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

  return (
    <div className="glass-panel p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-5 h-5 text-[#00e5ff]" />
          <h2 className="text-base text-[#e2e8f0] font-semibold tracking-wider">
            Hardware Device Rack & Logical Instance Remapper
          </h2>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-[#8492a6] hover:text-[#00e5ff] flex items-center gap-1 transition-colors"
          title="Reset device indices to default"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Reset Mapping
        </button>
      </div>

      <p className="text-xs text-[#8492a6] mb-4 leading-relaxed">
        Drag and drop devices to re-index logical joystick IDs (<code className="text-[#00e5ff]">js1</code>, <code className="text-[#00e5ff]">js2</code>).
        Solves Windows DirectInput device swap bugs without using the broken in-game <code className="text-[#ffaa00]">pp_resortdevices</code> command.
      </p>

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
    </div>
  );
};
