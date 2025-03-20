"use client";
import { assets } from "@/assets/assets";
import Message from "@/components/Message";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/SideBar";
import Image from "next/image";
import { useState } from "react";

const Home = () => {
  const [expland, setExpland] = useState<boolean>(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <div>
      <div className="flex h-screen">
        <Sidebar expland={expland} setExpland={setExpland} />
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
          <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
            <Image
              onClick={() => (expland ? setExpland(false) : setExpland(true))}
              className="rotate-180"
              src={assets.menu_icon}
              alt=""
            />
            <Image className="opacity-70" src={assets.chat_icon} alt="" />
          </div>

          {messages.length === 0 ? (
            <>
              <div className="flex items-center gap-3">
                <Image src={assets.logo_icon} alt="" className="h-16" />
                <p className="text-2xl font-medium">Hi, I'm DeepSeek.</p>
              </div>
              <p>How can I help you today?</p>
            </>
          ) : (
            <div>
              <Message role="user" content="What is next js" />
            </div>
          )}
          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading} />
          <p className="text-xs absolute bottom-1 text-gray-500">
            AI-generated, for reference only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
