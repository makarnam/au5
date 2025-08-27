import React from 'react';
import { useNavigate } from 'react-router-dom';
import RiskControlMatrixDashboard from '../../components/risk-control-matrix/RiskControlMatrixDashboard';

const RiskControlMatrixPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateMatrix = () => {
    navigate('/risk-control-matrix/create');
  };

  const handleMatrixSelect = (matrix: any) => {
    navigate(`/risk-control-matrix/${matrix.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <RiskControlMatrixDashboard
        onMatrixSelect={handleMatrixSelect}
        onCreateMatrix={handleCreateMatrix}
      />
    </div>
  );
};

export default RiskControlMatrixPage;
