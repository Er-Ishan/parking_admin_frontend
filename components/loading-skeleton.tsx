export default function LoadingSkeleton({ height = "h-24", text = "Loading..." }) {
    return (
        <div className={`rounded-lg bg-muted animate-pulse flex items-center justify-center ${height}`}>
            <span className="text-sm text-muted-foreground">{text}</span>
        </div>
    );
}
