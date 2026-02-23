const token = 'eyJhbGciOiJIUzM4NCJ9.eyJyb2xlIjoiUk9MRV9BRE1JTiIsImZ1bGxOYW1lIjoiTmdvVmlldEhvYW5nIiwidXNlcklkIjoxNCwiZW1haWwiOiJIb2FuZ252YWJAZ21haWwuY29tIiwidXNlcm5hbWUiOiJIb2FuZ252YWJAZ21haWwuY29tIiwic3ViIjoiSG9hbmdudmFiQGdtYWlsLmNvbSIsImlhdCI6MTc3MTgzNzExNCwiZXhwIjoxNzcxODQwNzE0fQ.JSuxgSnX6tI_BI3D3N0fCuMmfo8yqf5WeYl_bDtSBKJlnG8NHHNRbYZKkUdxucTb';

async function run() {
    try {
        console.log("Fetching dashboard stats...");
        const statsRes = await fetch('http://localhost:8080/api/v1/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Stats status:", statsRes.status);
        console.log("Stats body:", await statsRes.text());

        console.log("\nFetching monthly revenue...");
        const revRes = await fetch('http://localhost:8080/api/v1/admin/revenue/monthly', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Monthly Rev status:", revRes.status);
        console.log("Monthly Rev body:", await revRes.text());
        
    } catch(e) {
        console.error(e);
    }
}
run();
