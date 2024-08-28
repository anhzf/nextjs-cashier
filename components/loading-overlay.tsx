interface LoadingOverlayProps {
  title?: string;
  fixed?: boolean;
  message?: string;
}

export function LoadingOverlay({ title = 'Loading...', message, fixed }: LoadingOverlayProps) {
  return (
    <div className={`${fixed ? 'fixed' : 'absolute'} z-50 inset-0 flex flex-col justify-center items-center bg-gray-700/50`}>
      <div className="bg-white p-4 rounded shadow-lg
            backdrop-filter backdrop-blur-sm">
        <div className="flex justify-center items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          <p>{title}</p>
        </div>
        {message
          && (<p className="text-sm text-center text-muted-foreground">Mohon tunggu sebentar</p>)}
      </div>
    </div>
  );
}