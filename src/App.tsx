import React, { useState, useMemo } from 'react';
import { floorPlans, kitchenOptions, floorOptions, upgrades } from './data/config';
import { ConfigurationStep } from './components/ConfigurationStep';
import { FloorPlanSelector } from './components/FloorPlanSelector';
import { InteriorSelector } from './components/InteriorSelector';
import { ExteriorSelector } from './components/ExteriorSelector';
import { UpgradeSelector } from './components/UpgradeSelector';
import { Summary } from './components/Summary';
import { Configuration } from './types';
import { KebabMenu } from './components/KebabMenu';
import { AdminPanel } from './pages/AdminPanel';
import { images } from './config/images';

function App() {
  const [step, setStep] = useState(1);
  const [showAdmin, setShowAdmin] = useState(false);
  const [config, setConfig] = useState<Configuration>({
    floorPlan: 'plan-a',
    kitchen: 'dark-grey',
    floor: 'clear-white',
    facade: 'black-stained',
    upgrades: [],
    basePrice: floorPlans[0].price,
  });

  const totalPrice = useMemo(() => {
    const selectedKitchen = kitchenOptions.find(k => k.id === config.kitchen);
    const selectedFloor = floorOptions.find(f => f.id === config.floor);
    const selectedUpgrades = upgrades.filter(u => config.upgrades.includes(u.id));
    
    const upgradesTotal = selectedUpgrades.reduce((sum, u) => sum + u.price, 0);

    return config.basePrice + 
           (selectedKitchen?.price || 0) + 
           (selectedFloor?.price || 0) + 
           upgradesTotal;
  }, [config]);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleUpgradeToggle = (id: string) => {
    setConfig(prev => ({
      ...prev,
      upgrades: prev.upgrades.includes(id)
        ? prev.upgrades.filter(u => u !== id)
        : [...prev.upgrades, id],
    }));
  };

  const handleConfigUpdate = (updates: Partial<Configuration>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const getNextButtonText = () => {
    switch (step) {
      case 1: return 'Interior';
      case 2: return 'Exterior';
      case 3: return 'Upgrades';
      case 4: return 'Summary';
      default: return '';
    }
  };

  const getCurrentImage = () => {
    switch (step) {
      case 1: return images.floorPlan.default;
      case 2: return images.interior.default;
      case 3: return images.exterior.default;
      case 4: return images.exterior.default;
      case 5: return null;
      default: return images.floorPlan.default;
    }
  };

  if (showAdmin) {
    return (
      <div className="relative">
        <AdminPanel />
        <button
          onClick={() => setShowAdmin(false)}
          className="fixed bottom-4 left-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Back to Configurator
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex">
      <div className="w-2/3 flex-shrink-0 border-r border-gray-200 overflow-hidden">
        {getCurrentImage() && (
          <div className="h-full">
            <img 
              src={getCurrentImage()} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="w-1/3 flex flex-col">
        <div className="flex border-b border-gray-200">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              className={`flex-1 h-20 px-4 text-sm font-medium ${
                step === num ? 'text-black border-b-2 border-black' : 'text-gray-400'
              }`}
              onClick={() => setStep(num)}
            >
              {num.toString().padStart(2, '0')}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-12 pb-32">
          {step === 1 && (
            <FloorPlanSelector
              plans={floorPlans}
              selectedPlan={config.floorPlan}
              onSelect={(id) => setConfig(prev => ({
                ...prev,
                floorPlan: id,
                basePrice: floorPlans.find(p => p.id === id)?.price || prev.basePrice,
              }))}
            />
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-[32px] leading-10 font-medium">Interior</h2>
              <InteriorSelector
                title="Kitchen"
                options={kitchenOptions}
                selected={config.kitchen}
                onSelect={(id) => setConfig(prev => ({ ...prev, kitchen: id }))}
              />
              <InteriorSelector
                title="Floor"
                options={floorOptions}
                selected={config.floor}
                onSelect={(id) => setConfig(prev => ({ ...prev, floor: id }))}
              />
            </div>
          )}

          {step === 3 && (
            <ExteriorSelector
              config={config}
              onUpdate={handleConfigUpdate}
            />
          )}

          {step === 4 && (
            <UpgradeSelector
              upgrades={upgrades}
              selected={config.upgrades}
              onToggle={handleUpgradeToggle}
            />
          )}

          {step === 5 && (
            <Summary config={config} />
          )}
        </div>

        {step < 5 && (
          <div className="fixed bottom-0 right-0 w-1/3 bg-white border-t border-gray-200">
            <div className="max-w-3xl mx-auto px-12 py-4">
              <button
                onClick={handleNext}
                className="w-full h-16 flex items-center justify-between px-6 bg-black text-white hover:bg-gray-900 transition-colors"
              >
                <span className="text-base font-medium">
                  Next - {getNextButtonText()}
                </span>
                <span className="text-base font-medium">{totalPrice.toLocaleString()} €</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4">
        <KebabMenu onAdminClick={() => setShowAdmin(true)} />
      </div>
    </div>
  );
}

export default App;