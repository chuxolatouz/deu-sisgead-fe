import React from 'react';
import {
  Document, Text, Page, View, StyleSheet, Font,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale'

// Helper function for Venezuelan currency format
const formatMontoVE = (amount) => {
  // Manejar strings con coma (formato venezolano del backend)
  let num = amount;
  if (typeof amount === 'string') {
    num = parseFloat(amount.replace(',', '.'));
  }
  num = Number(num) || 0;
  return `Bs. ${num.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


// Create styles
// Registrar fuente
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

// Crear estilos mejorados
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20, // Agregamos padding para márgenes
    fontFamily: 'Helvetica', // Fuente base
  },
  header: {
    textAlign: 'center',
    marginBottom: 15,
  },
  headerColumn: {
    flexGrow: 1,
    justifyContent: 'space-around',
  },
  section: {
    marginBottom: 20, // Espaciado entre secciones
  },
  sectionDown: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginRight: 20,
    marginBottom: 10,
  },
  textHeader: {
    fontSize: 14,
    fontWeight: 'bold', // Títulos en negrita
    marginBottom: 8,
  },
  textBody: {
    fontSize: 10,
    lineHeight: 1.5, // Espaciado entre líneas
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    marginTop: 10,
  },
});

function Acta({ project, movements = [], logs = [], budgets = [] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerColumn}>
          <View style={styles.header}>
            <Text style={styles.textBody}>Universidad Central de Venezuela</Text>
            <Text style={styles.textBody}>Facultad de Ciencias</Text>
            <Text style={styles.textBody}>Escuela de Computación</Text>
            <Text style={styles.textBody}>ENII</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.textHeader}>Acta de Finalización</Text>
          <Text style={styles.textBody}>Proyecto: {project.nombre}</Text>
        </View>
        <View style={styles.sectionDown}>
          <Text style={styles.textBody}>
            Caracas {format(new Date(project.fecha_inicio), 'dd MMM, yyyy', { locale: es })}
          </Text>
        </View>
      </Page>

      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.textHeader}>Descripción del Proyecto</Text>
          <Text style={styles.textBody}>{project.descripción}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.textHeader}>Balance inicial y final</Text>
          <Text style={styles.textBody}>{`El proyecto inicia con un balance de: ${formatMontoVE(project.balance_inicial)}`}</Text>
          <Text style={styles.textBody}>{`Finalizando con un total de: ${formatMontoVE(project.balance)}`}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.textHeader}>Reglas de distribución</Text>
          <Text style={styles.textBody}>Las reglas de distribución definidas para cada rol quedan:</Text>
          <Text style={styles.textBody}>{`Usuarios con role Miembro: %${project.reglas.miembro} `}</Text>
          <Text style={styles.textBody}>{`Usuarios con role Líder: %${project.reglas.lider}`}</Text>
          <Text style={styles.textBody}>{`Usuarios con role Coordinador: %${project.reglas.admin}`}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.textHeader}>Reglas Fijas</Text>
          <Text style={styles.textBody}>{`Descripción de la regla: ${project.regla_fija.nombre}`}</Text>
          <Text style={styles.textBody}>Las reglas fijas implicadas en este proyecto son las siguientes:</Text>
          {project.regla_fija.reglas.map((regla) => (
            <Text style={styles.textBody} key={`${regla.nombre_regla}+${regla.monto}`}>
              {`- ${regla.nombre_regla} con un monto de: ${formatMontoVE(regla.monto)}`}
            </Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.textHeader}>Miembros involucrados</Text>
          {project?.miembros?.map((user) => (
            <Text key={user.usuario._id.$oid} style={styles.textBody}>{`${user.usuario.nombre} bajo el rol: ${user.role.label} el dia ${user.fecha_ingreso}`}</Text>
          ))}
        </View>
      </Page>

      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.textHeader}>Movimientos asociados al proyecto</Text>
          <View>
            {logs.map((item) => (
              <Text style={styles.textBody} key={item._id.$oid}>
                {`fecha: ${format(new Date(item.fecha_creacion.$date), 'dd MMM, yyyy HH:mm', { locale: es })} accion: ${item.mensaje}`}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.textHeader}>Movimientos monetarios asociados al proyecto</Text>
          <View>
            {movements.map((item) => (
              <Text style={styles.textBody} key={item._id.$oid}>{`accion: ${item.type} monto ${formatMontoVE(item.amount)} usuario: ${item.user}`}</Text>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.textHeader}>Movimientos de presupuesto asociados al proyecto</Text>
          <View>
            {budgets.map((item) => (
              <Text style={styles.textBody} key={item._id.$oid}>{item.descripcion}</Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default Acta;
