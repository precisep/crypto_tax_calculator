import React from 'react';
import { FolderOpen } from 'lucide-react';

const CalculationsModal = ({ 
  showCalculations, 
  setShowCalculations, 
  calculationsList, 
  handleLoadCalculation 
}) => {
  if (!showCalculations) return null;

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h3><FolderOpen size={24} /> Saved Calculations</h3>
          <button className="modal-close" onClick={() => setShowCalculations(false)}>×</button>
        </div>
        
        <div className="modal-body">
          {calculationsList.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={48} />
              <h4>No saved calculations</h4>
              <p>Save your first calculation to see it here</p>
            </div>
          ) : (
            <div className="calculations-list">
              {calculationsList.map((calc) => (
                <div key={calc.id} className="calculation-item">
                  <div className="calculation-info">
                    <h4>{calc.name}</h4>
                    <p>{calc.transaction_count || 0} transactions • {new Date(calc.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="calculation-actions">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleLoadCalculation(calc.id)}
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalculationsModal;
