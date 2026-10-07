{{- define "helpdesk.fullname" -}}
{{- printf "%s-helpdesk" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "helpdesk.frontend.fullname" -}}
{{- printf "%s-frontend" (include "helpdesk.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "helpdesk.backend.fullname" -}}
{{- printf "%s-backend" (include "helpdesk.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "helpdesk.postgres.fullname" -}}
{{- printf "%s-postgres" (include "helpdesk.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
