import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
import joblib

def main():
    print("Loading data...")
    df = pd.read_csv('../data.csv')

    target = 'pass_status'
    
    # Select features manageable for a frontend form
    num_features = [
        'study_hours_per_day', 
        'attendance_percentage', 
        'previous_exam_score', 
        'daily_screen_time', 
        'sleep_hours'
    ]
    
    cat_features = [
        'gender', 
        'education_level'
    ]

    # Convert Pass/Fail to 1/0
    y = df[target].apply(lambda x: 1 if x == 'Pass' else 0)
    X = df[num_features + cat_features]

    # Preprocessing pipelines
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, num_features),
            ('cat', categorical_transformer, cat_features)
        ])

    # Append classifier to preprocessing pipeline
    # Now we have a full prediction pipeline
    clf = Pipeline(steps=[('preprocessor', preprocessor),
                          ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))])

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training model...")
    clf.fit(X_train, y_train)

    print("Evaluating model...")
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    print(f"Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred))

    print("Saving model...")
    # Save the pipeline
    joblib.dump(clf, 'model.joblib')
    
    # Save accuracy for the frontend to fetch
    with open('metrics.json', 'w') as f:
        f.write(f'{{"accuracy": {acc}}}')

    print("Done!")

if __name__ == '__main__':
    main()
