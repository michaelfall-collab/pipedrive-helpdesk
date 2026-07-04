import React, { useEffect, useState } from 'react';
import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

// 1. SET YOUR SECRET ACTIVATION KEY HERE
const MASTER_ACTIVATION_KEY = "RosewoodPipedriveClient"; 

export default function Modal() {
  const [inputKey, setInputKey] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function initPipedriveSDK() {
      const sdk = await new AppExtensionsSDK().initialize();
      // Forces the floating panel to a clean desktop size 
      await sdk.execute('resize', { width: 450, height: 700 });
    }
    initPipedriveSDK();

    // Check if this specific browser has already been unlocked previously
    const savedActivation = localStorage.getItem('crm_helpdesk_activated');
    if (savedActivation === 'true') {
      setIsActivated(true);
    }
  }, []);

  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputKey === MASTER_ACTIVATION_KEY) {
      localStorage.setItem('crm_helpdesk_activated', 'true');
      setIsActivated(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid activation key. Please contact support.');
    }
  };

  // --- SCREEN 1: LOCKED GATEKEEPER VIEW ---
  if (!isActivated) {
    return (
      <div style={{
        fontFamily: 'sans-serif',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '80vh',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#262626' }}>CRM Support Desk</h2>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 25px 0', lineHeight: '1.4' }}>
          This internal tool is reserved for active contracted clients. Please enter your organization's activation key to initialize the helpdesk.
        </p>
        
        <form onSubmit={handleActivationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="password"
            placeholder="Enter Activation Key"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <button type="submit" style={{
            padding: '12px',
            backgroundColor: '#00b452', // Clean Pipedrive green
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Activate Extension
          </button>
        </form>

        {errorMessage && (
          <p style={{ color: '#d93838', fontSize: '14px', marginTop: '15px', fontWeight: '500' }}>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // --- SCREEN 2: UNLOCKED WEBPAGE VIEW (YOUR EXACT SIZING SETTINGS) ---
  return (
    <div style={{ width: '450px', height: '700px', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="https://webforms.pipedrive.com/f/cty3EYJxr6OeHSgV6gfGUVoeYdOvosYCfA7DiRZKjuU5bJ5ro4XXvcjgQhUR08mL6P"
        title="CRM Internal Helpdesk Form"
        style={{ 
          width: '560px',             // Gives the form extra horizontal breathing room
          height: '1000px',           // Gives the form extra vertical space to hide the scrollbar
          border: 'none',
          transform: 'scale(0.8)',    // Visual shrink ray to fit the 450x700 box
          transformOrigin: 'top left' // Ensures it stays perfectly anchored in the top-left corner
        }}
      />
    </div>
  );
}