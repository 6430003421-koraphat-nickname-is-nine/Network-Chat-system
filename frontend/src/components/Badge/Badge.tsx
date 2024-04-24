const Badge = ({ isOnline }: { isOnline: boolean | undefined }) => {
  const status = isOnline ? "Online" : "Offline";
  const color = isOnline ? "bg-green-300" : "bg-gray-300";

  return (
    <div
      className={`flex items-center justify-center rounded-full ${color} w-16 text-xs py-1`}
    >
      {status}
    </div>
  );
};

export default Badge;
