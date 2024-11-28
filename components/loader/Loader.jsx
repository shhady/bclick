import './Loader.css';
export default function Loader() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="loaderText"></h2>
        <div className="loader"></div>
      </div>
    );
  }
