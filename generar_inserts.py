import csv

# Ruta al archivo CSV en tu sistema Windows
csv_file_path = r"C:\Users\neo_m\Downloads\ASDASDF.csv"

sql_values = []

with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile)
    # Si el CSV tiene encabezado, saltarlo (si no lo tiene, puedes comentar la siguiente línea)
    header = next(reader, None)

    # Valores predefinidos
    factor_emision_id_predef = 2
    sub_categoria_predef = "DefaultSubCat"
    categoria_predef = "Comercializadora Mix Electrico"

    for row in reader:
        # Se asume que cada fila tiene al menos 2 columnas:
        # [0] Comercializadora, [1] CO2ekWh.
        if len(row) < 2:
            continue  # Omitimos filas que no tengan al menos dos columnas

        # La primera columna (índice 0) es la Comercializadora
        comercializadora = row[0].strip().replace("'", "''")
        
        # La segunda columna (índice 1) es el valor de CO2ekWh
        try:
            co2ekwh = float(row[1])
        except ValueError:
            co2ekwh = 0.0

        # Generamos la línea de la sentencia SQL para este registro
        sql_line = f"({factor_emision_id_predef}, '{sub_categoria_predef}', '{categoria_predef}', '{comercializadora}', {co2ekwh})"
        sql_values.append(sql_line)

# Creamos la sentencia INSERT con todas las líneas generadas
sql_insert = (
    "INSERT INTO detallescomercializadoras (FactorEmisionID, SubCategoria, Categoria, Comercializadora, CO2ekWh)\n"
    "VALUES\n" + ",\n".join(sql_values) + ";"
)

print(sql_insert)
