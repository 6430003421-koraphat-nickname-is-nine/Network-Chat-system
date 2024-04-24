import { Link } from "react-router-dom";
import DormCard from "../../components/Provider/DormCard";
import { FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import FormDialog from "../../components/FormDialog/FormDialog";

function GroupChatPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groupsData, setGroupsData] = useState([]);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_BACKEND_URL}/group-chats/`;
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }

        const data = await response.json();
        setGroupsData(data);
      } catch (error) {
        console.error("Error fetching groups:", (error as Error).message);
      }
    };

    fetchGroups();
  }, [groupsData]);

  return (
    <div className="min-h-[calc(100vh-7rem)]">
      <ul className="grid max-w-[26rem] sm:max-w-[52.5rem] lg:max-w-7xl w-[100%] mt-[2rem] mb-[4rem] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-auto gap-6 lg:gap-y-8 xl:gap-x-8  px-4 sm:px-6 lg:px-8">
        {groupsData.map(
          (room: { id: string; groupName: string; imageURL: string }) => {
            return (
              <Link to={`/group-chats/${room.id}`}>
                <DormCard
                  key={room.id}
                  id={room.id}
                  title={room.groupName}
                  image={room.imageURL}
                  isGroup={true}
                />
              </Link>
            );
          }
        )}
      </ul>

      <button
        className="fixed text-xl font-extrabold bottom-20 right-10 bg-emerald-500 text-white p-2 rounded-full w-14 h-14 hover:bg-emerald-600"
        onClick={openDialog}
      >
        <div className="flex items-center justify-center">
          <FaPlus />
        </div>
      </button>

      <FormDialog isOpen={isDialogOpen} onClose={closeDialog} />
    </div>
  );
}
export default GroupChatPage;
