$hostIp = "145.79.26.180"
$ports = @(21, 22, 65002, 80, 443)

foreach ($port in $ports) {
    $res = Test-NetConnection -ComputerName $hostIp -Port $port -WarningAction SilentlyContinue
    Write-Host "Port $port : $($res.TcpTestSucceeded)"
}
