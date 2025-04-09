export function HeaderPage({ children, classname }: { children: React.ReactNode, classname: string }) {
    return (
        <header className={`${classname}`}>
            {children}
        </header>
    )
}