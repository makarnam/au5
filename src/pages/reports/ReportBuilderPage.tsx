import React from "react";
import ReportBuilder from "../../components/ReportBuilder";
import { motion } from "framer-motion";

const ReportBuilderPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ReportBuilder />
    </motion.div>
  );
};

export default ReportBuilderPage;