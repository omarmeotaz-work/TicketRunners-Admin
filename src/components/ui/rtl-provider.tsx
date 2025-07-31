import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface RTLContextType {
  isRTL: boolean;
  dir: "ltr" | "rtl";
}

const RTLContext = createContext<RTLContextType | undefined>(undefined);

interface RTLProviderProps {
  children: ReactNode;
}

export const RTLProvider: React.FC<RTLProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  useEffect(() => {
    // Set document direction
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;

    // Add RTL class to body for additional styling
    if (isRTL) {
      document.body.classList.add("rtl");
      document.documentElement.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
      document.documentElement.classList.remove("rtl");
    }
  }, [dir, isRTL, i18n.language]);

  return (
    <RTLContext.Provider value={{ isRTL, dir }}>{children}</RTLContext.Provider>
  );
};

export const useRTL = () => {
  const context = useContext(RTLContext);
  if (context === undefined) {
    throw new Error("useRTL must be used within an RTLProvider");
  }
  return context;
};

// RTL-aware components
export const RTLText: React.FC<{
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center" | "justify";
}> = ({ children, className = "", align = "right" }) => {
  const { isRTL } = useRTL();

  const getAlignmentClass = () => {
    if (align === "center") return "text-center";
    if (align === "justify") return "text-justify";
    return isRTL ? "text-right" : "text-left";
  };

  return (
    <div className={`${getAlignmentClass()} ${className}`}>{children}</div>
  );
};

export const RTLFlex: React.FC<{
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}> = ({ children, className = "", reverse = false }) => {
  const { isRTL } = useRTL();

  const getFlexDirection = () => {
    if (reverse) {
      return isRTL ? "flex-row" : "flex-row-reverse";
    }
    return isRTL ? "flex-row-reverse" : "flex-row";
  };

  return <div className={`${getFlexDirection()} ${className}`}>{children}</div>;
};

export const RTLIcon: React.FC<{
  children: ReactNode;
  className?: string;
  position?: "left" | "right";
}> = ({ children, className = "", position = "right" }) => {
  const { isRTL } = useRTL();

  const getIconClass = () => {
    const isIconLeft = position === "left";
    const shouldReverse = isRTL ? !isIconLeft : isIconLeft;
    return shouldReverse ? "order-first" : "order-last";
  };

  return <div className={`${getIconClass()} ${className}`}>{children}</div>;
};

export const RTLNumber: React.FC<{
  value: number | string;
  className?: string;
  locale?: string;
}> = ({ value, className = "", locale }) => {
  const { i18n } = useTranslation();
  const { isRTL } = useRTL();

  const formatNumber = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    const currentLocale = locale || i18n.language;

    return new Intl.NumberFormat(currentLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <span className={`${isRTL ? "rtl-number" : ""} ${className}`}>
      {formatNumber(value)}
    </span>
  );
};

export const RTLDate: React.FC<{
  date: Date | string;
  className?: string;
  format?: string;
}> = ({ date, className = "", format = "PPP" }) => {
  const { i18n } = useTranslation();
  const { isRTL } = useRTL();

  const formatDate = (dateValue: Date | string) => {
    const dateObj =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    const currentLocale = i18n.language;

    return new Intl.DateTimeFormat(currentLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  };

  return (
    <span className={`${isRTL ? "rtl-date" : ""} ${className}`}>
      {formatDate(date)}
    </span>
  );
};

export const RTLTime: React.FC<{
  date: Date | string;
  className?: string;
}> = ({ date, className = "" }) => {
  const { i18n } = useTranslation();
  const { isRTL } = useRTL();

  const formatTime = (dateValue: Date | string) => {
    const dateObj =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    const currentLocale = i18n.language;

    return new Intl.DateTimeFormat(currentLocale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(dateObj);
  };

  return (
    <span className={`${isRTL ? "rtl-time" : ""} ${className}`}>
      {formatTime(date)}
    </span>
  );
};

export const RTLButton: React.FC<{
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
}> = ({
  children,
  className = "",
  icon,
  iconPosition = "right",
  variant = "default",
  size = "md",
  onClick,
  disabled = false,
}) => {
  const { isRTL } = useRTL();

  const getButtonClasses = () => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantClasses = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    };

    const sizeClasses = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-8 text-lg",
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  const getIconClass = () => {
    const isIconLeft = iconPosition === "left";
    const shouldReverse = isRTL ? !isIconLeft : isIconLeft;
    return shouldReverse ? "order-first mr-2" : "order-last ml-2";
  };

  return (
    <button
      className={getButtonClasses()}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className={getIconClass()}>{icon}</span>}
      {children}
    </button>
  );
};

export const RTLInput: React.FC<{
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "password" | "number";
  disabled?: boolean;
}> = ({
  placeholder,
  className = "",
  value,
  onChange,
  type = "text",
  disabled = false,
}) => {
  const { isRTL } = useRTL();

  const getInputClasses = () => {
    const baseClasses =
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    return `${baseClasses} ${isRTL ? "text-right" : "text-left"} ${className}`;
  };

  return (
    <input
      type={type}
      className={getInputClasses()}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      dir={isRTL ? "rtl" : "ltr"}
    />
  );
};

export const RTLSelect: React.FC<{
  children: ReactNode;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}> = ({ children, className = "", value, onValueChange, placeholder }) => {
  const { isRTL } = useRTL();

  const getSelectClasses = () => {
    const baseClasses =
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    return `${baseClasses} ${isRTL ? "text-right" : "text-left"} ${className}`;
  };

  return (
    <select
      className={getSelectClasses()}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
};

export const RTLTable: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = "" }) => {
  const { isRTL } = useRTL();

  const getTableClasses = () => {
    const baseClasses = "w-full caption-bottom text-sm";
    return `${baseClasses} ${isRTL ? "rtl-table" : ""} ${className}`;
  };

  return (
    <table className={getTableClasses()} dir={isRTL ? "rtl" : "ltr"}>
      {children}
    </table>
  );
};

export const RTLTableCell: React.FC<{
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}> = ({ children, className = "", align = "right" }) => {
  const { isRTL } = useRTL();

  const getAlignmentClass = () => {
    if (align === "center") return "text-center";
    return isRTL ? "text-right" : "text-left";
  };

  return (
    <td className={`p-4 align-middle ${getAlignmentClass()} ${className}`}>
      {children}
    </td>
  );
};

export const RTLTableHeader: React.FC<{
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}> = ({ children, className = "", align = "right" }) => {
  const { isRTL } = useRTL();

  const getAlignmentClass = () => {
    if (align === "center") return "text-center";
    return isRTL ? "text-right" : "text-left";
  };

  return (
    <th
      className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${getAlignmentClass()} ${className}`}
    >
      {children}
    </th>
  );
};
