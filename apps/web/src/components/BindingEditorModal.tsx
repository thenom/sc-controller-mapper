import React, { useState, useEffect } from 'react';
import type { 
  ActionBinding, 
  BindingInput, 
  BindType, 
  ActivationMode, 
  HardwarePrefix 
} from '@sc-mapping/shared-types';
import { 
  X, 
  Radio, 
  Plus, 
  Trash2, 
  Save, 
  HelpCircle, 
  Layers,
  Gamepad2
} from 'lucide-react';
import { useGamepadListener } from '../hooks/useGamepadListener';

interface BindingEditorModalProps {
  mapName: string;
  action: ActionBinding;
  isOpen: boolean;
  onClose: () => void;
  onSave: (mapName: string, actionName: string, inputs: BindingInput[]) => void;
}

export const BindingEditorModal: React.FC<BindingEditorModalProps> = ({
  mapName,
  action,
  isOpen,
  onClose,
  onSave
}) => {
  const [inputs, setInputs] = useState<BindingInput[]>([]);
  const [isCapturingIndex, setIsCapturingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputs(JSON.parse(JSON.stringify(action.inputs || [])));
      setIsCapturingIndex(null);
    }
  }, [isOpen, action]);

  // Hook for capturing hardware input
  useGamepadListener({
    isListening: isCapturingIndex !== null,
    onInputDetected: (evt) => {
      if (isCapturingIndex !== null) {
        handleUpdateInputString(isCapturingIndex, evt.scInputString);
        setIsCapturingIndex(null);
      }
    }
  });

  if (!isOpen) return null;

  const handleUpdateInputString = (idx: number, rawInput: string) => {
    const updated = [...inputs];
    const match = rawInput.match(/^([a-z0-9]+)_(.+)$/i);
    const prefix = (match ? match[1].toLowerCase() : 'kb1') as HardwarePrefix;
    const hardwareKey = match ? match[2] : rawInput;

    updated[idx] = {
      ...updated[idx],
      input: rawInput,
      devicePrefix: prefix,
      hardwareKey: hardwareKey
    };
    setInputs(updated);
  };

  const handleUpdateActivationMode = (idx: number, mode: string) => {
    const updated = [...inputs];
    updated[idx] = {
      ...updated[idx],
      activationMode: (mode === 'none' ? undefined : mode as ActivationMode)
    };
    setInputs(updated);
  };

  const handleUpdateMultiTap = (idx: number, tapStr: string) => {
    const updated = [...inputs];
    updated[idx] = {
      ...updated[idx],
      multiTap: (tapStr === '1' || !tapStr ? undefined : parseInt(tapStr, 10))
    };
    setInputs(updated);
  };

  const handleUpdateBindType = (idx: number, type: BindType) => {
    const updated = [...inputs];
    updated[idx] = {
      ...updated[idx],
      bindType: type
    };
    setInputs(updated);
  };

  const handleAddInput = () => {
    const isFirst = inputs.length === 0;
    const newInput: BindingInput = {
      input: 'js1_button1',
      devicePrefix: 'js1',
      hardwareKey: 'button1',
      bindType: isFirst ? 'rebind' : 'addbind',
      activationMode: undefined,
      multiTap: undefined
    };
    setInputs([...inputs, newInput]);
  };

  const handleRemoveInput = (idx: number) => {
    const updated = inputs.filter((_, i) => i !== idx);
    setInputs(updated);
  };

  const handleSave = () => {
    onSave(mapName, action.name, inputs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-2xl p-6 relative border border-[#00e5ff] shadow-[0_0_30px_rgba(0,229,255,0.2)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8492a6] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[rgba(0,229,255,0.15)] text-[#00e5ff] font-semibold">
              {mapName}
            </span>
            <span className="text-xs font-mono text-[#8492a6]">
              {action.name}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">
            {action.label || action.name}
          </h2>
          {action.description && (
            <p className="text-xs text-[#8492a6] mt-0.5">{action.description}</p>
          )}
        </div>

        {/* Bindings List */}
        <div className="space-y-4 mb-6 max-h-[360px] overflow-y-auto pr-1">
          {inputs.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8492a6] border border-dashed border-[#2d415f] rounded">
              No hardware inputs currently bound to this action.
            </div>
          ) : (
            inputs.map((inp, idx) => {
              const isCapturing = isCapturingIndex === idx;

              return (
                <div
                  key={idx}
                  className={`p-4 rounded border transition-all ${
                    isCapturing
                      ? 'border-[#00e5ff] bg-[rgba(0,229,255,0.08)] shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                      : 'border-[#2d415f] bg-[#090d15]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#8492a6]">#{idx + 1}</span>
                      {/* Bind Type Selector */}
                      <select
                        value={inp.bindType}
                        onChange={(e) => handleUpdateBindType(idx, e.target.value as BindType)}
                        className="text-xs font-mono font-semibold px-2 py-1 rounded bg-[#0d131f] border border-[#2d415f] text-[#e2e8f0] focus:border-[#00e5ff]"
                      >
                        <option value="rebind">rebind (Primary Override)</option>
                        <option value="addbind">addbind (Additive Concurrent)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleRemoveInput(idx)}
                      className="text-xs text-[#8492a6] hover:text-[#ff3344] p-1 transition-colors"
                      title="Delete this binding"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Input Descriptor & Capture */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[11px] text-[#8492a6] block mb-1 font-mono">
                        Hardware Input Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inp.input}
                          onChange={(e) => handleUpdateInputString(idx, e.target.value)}
                          placeholder="e.g. js1_button1, kb1_space"
                          className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#05070a] border border-[#2d415f] rounded text-[#00e5ff] focus:border-[#00e5ff] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setIsCapturingIndex(isCapturing ? null : idx)}
                          className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-all flex items-center gap-1 shrink-0 ${
                            isCapturing
                              ? 'bg-[#ff3344] text-white animate-pulse'
                              : 'bg-[rgba(0,229,255,0.15)] text-[#00e5ff] border border-[rgba(0,229,255,0.4)] hover:bg-[#00e5ff] hover:text-black'
                          }`}
                          title="Click then press any controller button/trigger or move axis"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          {isCapturing ? 'Listening...' : 'Capture'}
                        </button>
                      </div>
                    </div>

                    {/* Activation Mode & Multi-Tap */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-[#8492a6] block mb-1 font-mono">
                          Activation Mode
                        </label>
                        <select
                          value={inp.activationMode || 'none'}
                          onChange={(e) => handleUpdateActivationMode(idx, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-[#05070a] border border-[#2d415f] rounded text-[#e2e8f0] focus:border-[#00e5ff]"
                        >
                          <option value="none">default (press)</option>
                          <option value="press">press</option>
                          <option value="hold">hold</option>
                          <option value="double_tap">double_tap</option>
                          <option value="delayed_press">delayed_press</option>
                          <option value="smart_toggle">smart_toggle</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-[#8492a6] block mb-1 font-mono">
                          MultiTap
                        </label>
                        <select
                          value={inp.multiTap || 1}
                          onChange={(e) => handleUpdateMultiTap(idx, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-[#05070a] border border-[#2d415f] rounded text-[#e2e8f0] focus:border-[#00e5ff]"
                        >
                          <option value="1">1 (Single Tap)</option>
                          <option value="2">2 (Double Tap)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {isCapturing && (
                    <div className="text-[11px] text-[#00e5ff] bg-[rgba(0,229,255,0.1)] p-2 rounded flex items-center gap-2 animate-pulse">
                      <Gamepad2 className="w-4 h-4 shrink-0" />
                      <span>Press any physical button or deflect any joystick/throttle axis now...</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#2d415f]">
          <button
            type="button"
            onClick={handleAddInput}
            className="text-xs text-[#00e5ff] hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.3)] hover:bg-[#00e5ff] hover:text-black transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Input Binding
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#8492a6] hover:text-white px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-sci-fi"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
