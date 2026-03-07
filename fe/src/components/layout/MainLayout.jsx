import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AssistantChatBox from '../common/AssistantChatBox';

const MainLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <AssistantChatBox />
        </div>
    );
};

export default MainLayout;
