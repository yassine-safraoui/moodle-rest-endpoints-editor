export default function ColoredSpan({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "orange" | "blue" | "green" | "red" | "pink" | "gray";
}) {
  switch (color) {
    case "orange":
      return <span className="text-syntax-orange">{children}</span>;
    case "blue":
      return <span className="text-syntax-blue">{children}</span>;
    case "green":
      return <span className="text-syntax-green">{children}</span>;
    case "red":
      return <span className="text-syntax-red">{children}</span>;
    case "pink":
      return <span className="text-syntax-pink">{children}</span>;
    case "gray":
      return <span className="text-syntax-gray">{children}</span>;
  }
}
