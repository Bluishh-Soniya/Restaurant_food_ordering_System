import os
import win32com.client

doc_path = r"c:\Users\DELL\OneDrive\Desktop\RestroScan_Project\RestroScan_Major_Project_Report.doc"
docx_path = r"c:\Users\DELL\OneDrive\Desktop\RestroScan_Project\RestroScan_Major_Project_Report.docx"

try:
    word = win32com.client.DispatchEx("Word.Application")
    word.Visible = False
    print("Opening Word document...")
    doc = word.Documents.Open(doc_path)
    print("Saving as DOCX...")
    doc.SaveAs2(docx_path, FileFormat=16)
    print("Closing document...")
    doc.Close()
    word.Quit()
    print("Conversion successful.")
except Exception as e:
    print(f"Error during conversion: {e}")
