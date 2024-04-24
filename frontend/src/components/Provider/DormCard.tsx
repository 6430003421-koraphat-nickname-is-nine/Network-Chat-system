import { useUser } from "../../lib/context/UserContext";
import { createChat } from "../../lib/chat";
import { useNavigate } from "react-router-dom";
import Badge from "../Badge/Badge";

interface Props {
  id: string;
  title: string;
  image: string;
  isAdding?: boolean;
  isOnline?: boolean;
  isGroup?: boolean;
}

export default function DormCard(props: Props) {
  const { currentUser } = useUser();
  const navigate = useNavigate();

  async function handleCreateChat() {
    if (props.isGroup) return;
    if (!currentUser) return;

    const chatId = await createChat(props.id, currentUser.id);

    if (!chatId) return;

    navigate("/chats/" + chatId);
  }

  return (
    <li
      className={
        "group relative rounded-3xl bg-slate-100 p-6 hover:bg-slate-200 border"
      }
    >
      <div className="aspect-[672/494] relative rounded-md overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.08)] bg-slate-200">
        <img
          alt=""
          width="672"
          height="494"
          className="absolute inset-0 w-full h-full  object-cover"
          style={{ color: "transparent" }}
          src={
            props.image ||
            "https://images.unsplash.com/photo-1617957743097-0d20aa2ea762?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
        />
      </div>
      <div className="flex flex-wrap items-center mt-6 w-full ">
        <h2 className="text-sm truncate leading-6 text-slate-900 group-hover:text-emerald-600 w-full">
          <button onClick={handleCreateChat} className="w-full">
            <span className="absolute inset-0 rounded-3xl"></span>

            <div className="flex justify-between items-center w-full">
              <p className="font-bold truncate text-base">{props.title}</p>
              {!props.isGroup && <Badge isOnline={props.isOnline} />}
            </div>
          </button>
        </h2>
      </div>
    </li>
  );
}
