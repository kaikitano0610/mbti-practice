"use client";
import Image from "next/image";
import { MBTIProfile } from "../lib/mbti-profile";

type SingleCardProps = {
  type: string;
  profile: MBTIProfile
  onClick: () => void;
};



export default function SingleCard({ type, profile, onClick }: SingleCardProps) {

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        cursor-pointer overflow-hidden relative group h-full flex flex-col 
        bg-white border-2 border-black rounded-xl
        p-0 focus:outline-none focus:ring-4 focus:ring-black/30
      "
      style={{ width: "260px" }}
    >
      <div
        className={`h-24 w-full flex items-center justify-center ${profile.color} bg-[#8c52ff] overflow-hidden`}
      >
        <Image
          src={profile.img}
          alt=""
          width={200}
          height={150}
          className="mx-auto pt-20"
        />
      </div>

      <div className="px-4 py-2 flex flex-col flex-grow border-t-2 border-black">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-2xl font-black">{type}</h3>
          <span className="text-xs bg-black text-white px-3 py-1 rounded-full">
            {profile.name}
          </span>
        </div>

        <p className="text-sm font-bold text-gray-500 mb-2">{profile.alias}</p>

        <p className="text-sm text-[#515151] line-clamp-3 flex-grow font-medium">
          {profile.description}
        </p>

        <div className="mt-4 pt-2 border-t-2 border-dashed border-gray-200">
          <p className="text-xs text-red-500">❤️ {profile.loveStyle}</p>
        </div>
      </div>
    </button>
  );
}
