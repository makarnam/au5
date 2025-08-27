import React from "react";
import { motion } from "framer-motion";
import ReportCreationWizard from "../../components/ReportCreationWizard";

const ReportWizardPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ReportCreationWizard />
    </motion.div>
  );
};

export default ReportWizardPage;