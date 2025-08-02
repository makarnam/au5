import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LucideIcon, Clock, Sparkles, ArrowRight, Bell } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { notificationService } from "../../services/notificationService";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
  estimatedDate?: string;
  priority?: "high" | "medium" | "low";
  showNotifyButton?: boolean;
  onNotifyClick?: () => void;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  icon: Icon,
  features = [],
  estimatedDate,
  priority = "medium",
  showNotifyButton = true,
  onNotifyClick,
}) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const priorityColors = {
    high: "from-red-500 to-orange-500",
    medium: "from-blue-500 to-purple-500",
    low: "from-gray-500 to-gray-600",
  };

  const priorityLabels = {
    high: t("comingSoon.highPriority", "High Priority"),
    medium: t("comingSoon.mediumPriority", "Medium Priority"),
    low: t("comingSoon.lowPriority", "Low Priority"),
  };

  const handleNotificationClick = () => {
    if (user && onNotifyClick) {
      notificationService.subscribeToFeature(title, user.email, user.id);
    } else if (onNotifyClick) {
      onNotifyClick();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${priorityColors[priority]} mb-6`}
          >
            <Icon className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>

          {/* Priority Badge */}
          <div className="mt-6">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r ${priorityColors[priority]}`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {priorityLabels[priority]}
            </span>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Coming Soon Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <Clock className="w-6 h-6 text-blue-500 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">
                {t("comingSoon.developmentStatus", "Development Status")}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">
                  {t("comingSoon.status", "Status")}
                </span>
                <span className="text-blue-600 font-semibold">
                  {t("comingSoon.inDevelopment", "In Development")}
                </span>
              </div>

              {estimatedDate && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">
                    {t("comingSoon.estimatedRelease", "Estimated Release")}
                  </span>
                  <span className="text-green-600 font-semibold">
                    {estimatedDate}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <span className="text-gray-700 font-medium">
                  {t("comingSoon.progress", "Progress")}
                </span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "25%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-purple-600 font-semibold">25%</span>
              </div>
            </div>

            {showNotifyButton && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNotificationClick}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              >
                <Bell className="w-5 h-5 mr-2" />
                {t("comingSoon.notifyWhenReady", "Notify Me When Ready")}
              </motion.button>
            )}
          </motion.div>

          {/* Features List */}
          {features.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <div className="flex items-center mb-6">
                <Sparkles className="w-6 h-6 text-purple-500 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  {t("comingSoon.plannedFeatures", "Planned Features")}
                </h2>
              </div>

              <div className="space-y-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <ArrowRight className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
        >
          <p className="text-gray-600 text-lg">
            {t(
              "comingSoon.stayTuned",
              "Stay tuned for exciting updates! We're working hard to bring you this feature.",
            )}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {t(
              "comingSoon.suggestions",
              "Have suggestions or feedback? We'd love to hear from you!",
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
