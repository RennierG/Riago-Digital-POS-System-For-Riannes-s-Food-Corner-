const StatCard = ({ label, value, sub }) => {
    return (
        <article className="stat-card">
            <div>
                <span>{label}</span>
                <strong>{value}</strong>
                {sub && <small>{sub}</small>}
            </div>
        </article>
    )
}

export default StatCard
