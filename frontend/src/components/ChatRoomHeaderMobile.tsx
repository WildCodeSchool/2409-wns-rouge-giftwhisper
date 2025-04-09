import { ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";

export function ChatRoomHeaderMobile() {
    return (
        <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-[#FFFBFF] hover:text-[#FFFBFF]/80 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-[#FFFBFF] text-2xl font-medium">Pour Machin</h1>
            </div>
            
            <div className="flex items-center">
                <Link to="/settings" className="text-[#FFFBFF] hover:text-[#FFFBFF]/80 transition-colors p-2">
                    <Info size={24} />
                </Link>
            </div>
        </div>
    );
}