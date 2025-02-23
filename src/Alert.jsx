/* eslint-disable react/prop-types */
const Alert = ({ children, variant = "info" }) => {
  const styles = {
    info: "bg-blue-100 border-blue-500 text-blue-900",
    error: "bg-red-100 border-red-500 text-red-900",
    success: "bg-green-100 border-green-500 text-green-900",
    warning: "bg-yellow-100 border-yellow-500 text-yellow-900",
  };

  return (
    <div className={`p-4 border-l-4 rounded ${styles[variant]}`}>
      {children}
    </div>
  );
};

export default Alert;
