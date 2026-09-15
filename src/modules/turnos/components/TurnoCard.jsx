import { StatusBadge } from "../../../shared/components/StatusBadge.jsx";
import { getEstadoTurnoInfo, getTipoVehiculoLabel } from "../constants/turnoEnums.js";

/**
 * @param {{ turno: import("../api/turnosService.js").Turno }} props
 */
export function TurnoCard({ turno }) {
  const estado = getEstadoTurnoInfo(turno.estadoActual);
  const hora = turno.fechaIngreso
    ? new Date(turno.fechaIngreso).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <article className="card turno-card">
      <header className="turno-card__header">
        <span className="turno-card__numero">{turno.numeroTurno}</span>
        <StatusBadge label={estado.label} tone={estado.tone} />
      </header>
      <p className="turno-card__placa">{turno.placa}</p>
      <dl className="turno-card__details">
        <div>
          <dt>Vehículo</dt>
          <dd>{getTipoVehiculoLabel(turno.tipoVehiculo)}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{turno.telefonoCliente}</dd>
        </div>
        {hora && (
          <div>
            <dt>Ingreso</dt>
            <dd>{hora}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
