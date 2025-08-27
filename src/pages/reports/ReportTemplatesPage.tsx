import React from "react";
import { motion } from "framer-motion";
import ReportTemplateManager from "../../components/ReportTemplateManager";

const ReportTemplatesPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ReportTemplateManager />
    </motion.div>
  );
};

export default ReportTemplatesPage;