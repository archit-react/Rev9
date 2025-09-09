import { useEffect } from "react";

type Props = {
  title?: string; // e.g. "Home", "Users"
  brand?: string; // default: "Rev9"
  sep?: string; // default: " | "
};

export default function PageTitle({
  title,
  brand = "Rev9",
  sep = " | ",
}: Props) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title}${sep}${brand}` : brand;
    return () => {
      document.title = prev;
    };
  }, [title, brand, sep]);

  return null;
}
